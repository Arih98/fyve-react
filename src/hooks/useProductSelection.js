import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useProductSelection({
  product,
  location,
  searchParams,
  initialColorValue
}) {
  const navigate = useNavigate();
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentVariation, setCurrentVariation] = useState(null);

  const isColorAttribute = (name) => String(name || '').trim().toLowerCase() === 'color';
  const isSizeAttribute = (name) => String(name || '').trim().toLowerCase() === 'size';

  const attributeNames = useMemo(() => {
    if (!product || product.product_type !== 'variable' || !product.variations?.length) {
      return [];
    }

    return [
      ...new Set(
        product.variations.flatMap((v) => v.attributes.map((a) => a.attribute_name))
      )
    ].sort((a, b) => (a === 'Color' ? 1 : -1));
  }, [product]);

  useEffect(() => {
    if (!product || product.product_type !== 'variable' || !product.variations?.length) {
      setSelectedAttributes({});
      setCurrentVariation(null);
      return;
    }

    const initialVariation =
      product.variations.find((v) => {
        const colorAttr = v.attributes.find((a) => isColorAttribute(a.attribute_name));
        return colorAttr?.term_name?.trim().toLowerCase() === initialColorValue;
      }) || product.variations[0];

    const initialAttrs = {};

    initialVariation?.attributes.forEach((attr) => {
      const termName = String(attr.term_name || '').trim();
      if (termName && !termName.startsWith('Any')) {
        initialAttrs[attr.attribute_name] = termName;
      }
    });

    const colorKey =
      Object.keys(initialAttrs).find(isColorAttribute) ||
      initialVariation?.attributes?.find((attr) => isColorAttribute(attr.attribute_name))?.attribute_name ||
      'Color';

    if (location.state?.initialColor && !initialAttrs[colorKey]) {
      initialAttrs[colorKey] = location.state.initialColor;
    }

    setSelectedAttributes(initialAttrs);
    setCurrentVariation(initialVariation);
  }, [product, initialColorValue, location.state]);

  const getAvailableOptions = (attrName) => {
    if (!product?.variations?.length) return [];

    const otherSelected = { ...selectedAttributes };
    delete otherSelected[attrName];

    const optionsSet = new Set(
      product.variations
        .filter((v) =>
          Object.entries(otherSelected).every(([otherAttr, term]) => {
            const vAttr = v.attributes.find((a) => a.attribute_name === otherAttr);
            const vTermName = String(vAttr?.term_name || '');
            return vTermName === term || vTermName.startsWith('Any');
          })
        )
        .flatMap((v) => {
          const thisAttr = v.attributes.find((a) => a.attribute_name === attrName);
          const thisTermName = String(thisAttr?.term_name || '').trim();

          if (!thisTermName || thisTermName.startsWith('Any')) {
            return [];
          }

          return [thisTermName];
        })
    );

    const options = [...optionsSet];

    if (isSizeAttribute(attrName)) {
      options.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    } else {
      options.sort();
    }

    return options;
  };

  useEffect(() => {
    if (!product || product.product_type !== 'variable') return;
    if (!attributeNames.length) return;

    const hasAnySelection = attributeNames.some((attr) => !!selectedAttributes[attr]);
    if (!hasAnySelection) return;

    const matchingVariation = product.variations.find((v) =>
      attributeNames.every((attr) => {
        const sel = selectedAttributes[attr];
        if (!sel) return true;

        const vAttr = v.attributes.find((a) => a.attribute_name === attr);
        const vTermName = String(vAttr?.term_name || '');

        return vTermName === sel || vTermName === `Any ${attr}`;
      })
    );

    setCurrentVariation(matchingVariation || null);
  }, [selectedAttributes, product, attributeNames]);

  useEffect(() => {
    if (!product || product.product_type !== 'variable') return;

    let updatedSelected = { ...selectedAttributes };
    let changed = false;

    attributeNames.forEach((attr) => {
      const avail = getAvailableOptions(attr);
      if (selectedAttributes[attr] && !avail.includes(selectedAttributes[attr])) {
        updatedSelected[attr] = avail[0] || undefined;
        changed = true;
      }
    });

    if (changed) {
      setSelectedAttributes(updatedSelected);
    }
  }, [selectedAttributes, product, attributeNames]);

  const handleAttributeChange = (attrName, value) => {
    setSelectedAttributes((prev) => {
      const next = { ...prev, [attrName]: value };

      if (isColorAttribute(attrName)) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('color', value);

        navigate(`/product/${product.id}?${nextParams.toString()}`, {
          replace: true,
          state: {
            ...location.state,
            product,
            initialColor: value,
            preserveScroll: true,
            fromProductGrid: false,
            transitionKey: null
          }
        });
      }

      return next;
    });
  };

  return {
    selectedAttributes,
    currentVariation,
    attributeNames,
    handleAttributeChange,
    getAvailableOptions,
    isColorAttribute,
    isSizeAttribute
  };
}
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useProductSelection({
  product,
  location,
  searchParams,
  initialColorValue
}) {
  const navigate = useNavigate();

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
    ].sort((a, b) => {
      const aName = String(a || '').trim().toLowerCase();
      const bName = String(b || '').trim().toLowerCase();

      if (aName === bName) return 0;
      if (aName === 'size') return -1;
      if (bName === 'size') return 1;
      if (aName === 'color') return 1;
      if (bName === 'color') return -1;

      return aName.localeCompare(bName);
    });
  }, [product]);

  const initialVariation = useMemo(() => {
    if (!product || product.product_type !== 'variable' || !product.variations?.length) {
      return null;
    }

    const normalizedInitialColor = String(initialColorValue || '').trim().toLowerCase();

    if (!normalizedInitialColor) {
      return product.variations[0] || null;
    }

    return (
      product.variations.find((v) => {
        const colorAttr = v.attributes.find((a) => isColorAttribute(a.attribute_name));
        return String(colorAttr?.term_name || '').trim().toLowerCase() === normalizedInitialColor;
      }) || product.variations[0] || null
    );
  }, [product, initialColorValue]);

  const initialAttributes = useMemo(() => {
    if (!initialVariation) return {};

    const attrs = {};

    initialVariation.attributes.forEach((attr) => {
      const termName = String(attr.term_name || '').trim();
      if (termName && !termName.startsWith('Any')) {
        attrs[attr.attribute_name] = termName;
      }
    });

    const colorKey =
      Object.keys(attrs).find(isColorAttribute) ||
      initialVariation.attributes?.find((attr) => isColorAttribute(attr.attribute_name))?.attribute_name ||
      'Color';

    if (location.state?.initialColor && !attrs[colorKey]) {
      attrs[colorKey] = location.state.initialColor;
    }

    return attrs;
  }, [initialVariation, location.state, isColorAttribute]);

  const [selectedAttributes, setSelectedAttributes] = useState(initialAttributes);

  useEffect(() => {
    if (!product || product.product_type !== 'variable' || !product.variations?.length) {
      setSelectedAttributes({});
      return;
    }

    setSelectedAttributes((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(initialAttributes);

      if (prevKeys.length === nextKeys.length) {
        const same = nextKeys.every((key) => prev[key] === initialAttributes[key]);
        if (same) return prev;
      }

      return initialAttributes;
    });
  }, [product?.id, initialColorValue, initialAttributes]);

  const getAvailableOptions = (attrName, attributesOverride = selectedAttributes) => {
    if (!product?.variations?.length) return [];

    const otherSelected = { ...attributesOverride };
    delete otherSelected[attrName];

    const optionsSet = new Set(
      product.variations
        .filter((v) =>
          Object.entries(otherSelected).every(([otherAttr, term]) => {
            const vAttr = v.attributes.find((a) => a.attribute_name === otherAttr);
            const vTermName = String(vAttr?.term_name || '');
            return vTermName === term || vTermName === `Any ${otherAttr}`;
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

    let updatedSelected = { ...selectedAttributes };
    let changed = false;

    attributeNames.forEach((attr) => {
      const avail = getAvailableOptions(attr, updatedSelected);
      if (updatedSelected[attr] && !avail.includes(updatedSelected[attr])) {
        updatedSelected[attr] = avail[0] || undefined;
        changed = true;
      }
    });

    if (changed) {
      setSelectedAttributes(updatedSelected);
    }
  }, [selectedAttributes, product, attributeNames]);

  const currentVariation = useMemo(() => {
    if (!product || product.product_type !== 'variable' || !product.variations?.length) {
      return null;
    }

    const hasAnySelection = attributeNames.some((attr) => !!selectedAttributes[attr]);

    if (!hasAnySelection) {
      return initialVariation;
    }

    return (
      product.variations.find((v) =>
        attributeNames.every((attr) => {
          const sel = selectedAttributes[attr];
          if (!sel) return true;

          const vAttr = v.attributes.find((a) => a.attribute_name === attr);
          const vTermName = String(vAttr?.term_name || '');

          return vTermName === sel || vTermName === `Any ${attr}`;
        })
      ) || null
    );
  }, [product, attributeNames, selectedAttributes, initialVariation]);

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
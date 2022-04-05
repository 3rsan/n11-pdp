import productData from './product-data.json' assert { type: 'json' };

let selectedAttributes = [],
  selectedVariant = null,
  selectedScale = productData.baremList[0];

const init = () => {
  let productTitleEL = $('.product-title');
  productTitleEL.text(productData.productTitle);
};

const checkVariant = (firstValue, secondValue) => {
  return productData.productVariants.find(
    (variant) =>
      (variant.attributes[0].value === firstValue &&
        variant.attributes[1].value === secondValue) ||
      (variant.attributes[1].value === firstValue &&
        variant.attributes[0].value === secondValue)
  );
};

const showSelectedInfo = (selectedVariant, selectedScale) => {
  const { minimumQuantity, maximumQuantity } = selectedScale;
  if (selectedVariant) {
    console.log('selected variant id: ' + selectedVariant.id);
    console.log(
      'selected scale: [' + minimumQuantity + ' - ' + maximumQuantity + ']'
    );
  }
};

const bindEvents = () => {
  let attributeBoxEl = $('.attribute-box '),
    scalesEl = $('.scales'),
    quantityEl = $('#quantity'),
    isButtonEnabled = false;

  attributeBoxEl.on('click', (evt) => {
    let selectedBoxEl = $(evt.currentTarget).closest('.attribute-box'),
      attributeEl = selectedBoxEl.closest('.attribute'),
      selectedAttributeName = attributeEl.data('attribute-name'),
      selectedAttributeValue = selectedBoxEl.data('attribute-value');
    if (!selectedBoxEl.hasClass('disabled')) {
      attributeEl.find('.attribute-box').removeClass('active');

      selectedAttributes = selectedAttributes.map((item) => {
        const { name, value } = item;

        return {
          name,
          value:
            name === selectedAttributeName ? selectedAttributeValue : value,
        };
      });

      selectedBoxEl.addClass('active');

      setSelectableBoxes(
        attributeEl,
        selectedAttributeName,
        selectedAttributeValue
      );
      setImages();

      isButtonEnabled = !selectedAttributes.find((item) => item.value === '');

      if (isButtonEnabled) {
        $('.add-to-cart').removeClass('disabled');
        showSelectedInfo(selectedVariant, selectedScale);
      }
    }
  });

  quantityEl.on('change', (evt) => {
    let quantity = Number(evt.currentTarget.value),
      minQuantity = productData.baremList[0].minimumQuantity;

    if (quantity < minQuantity) {
      quantity = minQuantity;
      $('#quantity').val(quantity);
    }

    let selectedScaleIndex = productData.baremList.findIndex(
      (item) =>
        quantity >= item.minimumQuantity && quantity <= item.maximumQuantity
    );

    selectedScale =
      selectedScaleIndex > -1
        ? productData.baremList[selectedScaleIndex]
        : null;
    if (selectedScale) {
      $('.scale-item').removeClass('active');
      $(scalesEl.children()[selectedScaleIndex]).addClass('active');

      setTotalPrice(quantity, selectedScale.price);
    }
  });
};

const renderAttributes = () => {
  let attributesEl = $('.attributes');

  productData.selectableAttributes.map((item) => {
    const { name, values } = item;
    let attributeEl =
      $(`<div class="attribute attribute-${name} mt-3" data-attribute-name="${name}">  
          <p class="title">${name} <span>:</span></p>        
      </dıv>`);

    values.map((value) => {
      const valueEl = `<div class="attribute-box ms-2" data-attribute-value="${value}">
              <p class="text-center mt-2">${value}</p>
          </div>`;
      attributeEl.append(valueEl);
    });

    selectedAttributes.push({
      name,
      value: '',
    });

    attributesEl.append(attributeEl);
  });
};

const setTotalPrice = (quantity, price) => {
  const totalPrice = quantity * price;
  $('.total-price').text(`${totalPrice.toFixed(2)} TL`);
};

const renderScales = () => {
  let scalesEl = $('.scales'),
    minimumQuantity,
    stocksEl = $('.stocks .stock-quantity span'),
    quantityEl = $('#quantity');

  const sortedList = productData.baremList.sort(
    (a, b) => a.minimumQuantity - b.minimumQuantity
  );
  minimumQuantity = sortedList ? sortedList[0].minimumQuantity : 0;
  quantityEl.attr('value', minimumQuantity);

  let quantity = quantityEl.attr('value');
  productData.baremList.map((item) => {
    const { price, minimumQuantity, maximumQuantity } = item;
    let isActive = quantity >= minimumQuantity && quantity <= maximumQuantity;

    let scaleEl = $(`<div class="scale-item ${
      isActive ? 'active' : ''
    } col-6 col-sm-4 col-md-3">
      <p>${minimumQuantity} - ${maximumQuantity} <br />${price} TL</p>
    </div>`);

    if (isActive) {
      setTotalPrice(quantity, price);
    }

    scalesEl.append(scaleEl);
  });

  stocksEl.text(productData.stock);
};

const renderImages = (images) => {
  let imagesEl = $('.images');
  let mainImagesEl = $('.main-images');

  imagesEl.empty();
  mainImagesEl.empty();

  images.map((image, index) => {
    let imageEl = $(`<button
    type="button"
    data-bs-target="#myCarousel"
    data-bs-slide-to="${index}"
    class="${index === 0 ? 'active' : ''}"
    aria-current="true"
    aria-label="Slide 1"
  >
    <img
      src="${image}"
      alt="thumbnail-${index}"
      class="d-block w-100 shadow-1-strong rounded"
    />
  </button>`);

    let mainImageEl = $(`<div class="carousel-item ${
      index === 0 ? 'active' : ''
    }" data-bs-interval="10000">
      <img
        src="${image}"
        alt="image-${index}"
        class="d-block w-100"
      />
    </div>`);

    imagesEl.append(imageEl);
    mainImagesEl.append(mainImageEl);
  });
};

const setImages = () => {
  //  slide-images

  productData.productVariants.map((item) => {
    let selected = true;

    selectedAttributes.map((selectedAttribute) => {
      let attribute = item.attributes.find(
        (attr) => attr.name === selectedAttribute.name
      );
      if (attribute.value !== selectedAttribute.value) {
        selected = false;
      }
    });

    if (selected) {
      renderImages(item.images);
    }
  });
};

const setSelectableBoxes = (
  selectedElement,
  selectedAttributeName,
  selectedAttributeValue
) => {
  let filteredAttributes = productData.selectableAttributes.filter(
    (selectableAttribute) => selectableAttribute.name !== selectedAttributeName
  );

  let selectableBoxes = [];
  filteredAttributes[0].values.map((attrValue) => {
    selectedVariant = checkVariant(selectedAttributeValue, attrValue);
    if (selectedVariant) {
      selectableBoxes.push(attrValue);
    }
  });

  let siblings = selectedElement.siblings();

  if (siblings.length > 0) {
    $('.attribute-box').removeClass('disabled');
    $(siblings[0])
      .find('.attribute-box')
      .map((key, data) => {
        let attributeBoxEl = $(data);
        let value = attributeBoxEl.data('attribute-value');
        if (!selectableBoxes.includes(value)) {
          attributeBoxEl.addClass('disabled');
        }
      });
  }
};

init();
renderAttributes();
renderScales();
renderImages(productData.productVariants[0].images);
bindEvents();

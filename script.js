const easingOutQuint = (x, t, b, c, d) =>
  c * ((t = t / d - 1) * t * t * t * t + 1) + b;

function smoothScrollPolyfill (node, key, target) {
  const startTime = Date.now();
  const offset = node[key];
  const gap = target - offset;
  const duration = 1000;
  let interrupt = false;

  const step = () => {
    const elapsed = Date.now() - startTime;
    const percentage = elapsed / duration;

    if (interrupt) {
      return;
    }

    if (percentage > 1) {
        cleanup();
        return;
      }
  
      node[key] = easingOutQuint(0, elapsed, offset, gap, duration);
      requestAnimationFrame(step);
    }
  
    const cancel = () => {
      interrupt = true;
      cleanup();
    }
  
    const cleanup = () => {
      node.removeEventListener('wheel', cancel);
      node.removeEventListener('touchstart', cancel);
    }
  
    node.addEventListener('wheel', cancel, { passive: true });
    node.addEventListener('touchstart', cancel, { passive: true });
  
    step();
  
    return cancel;
  }
  
  function testSupportsSmoothScroll () {
    let supports = false;
    try {
      let div = document.createElement('div');
      div.scrollTo({
        top: 0,
        get behavior () {
          supports = true;
          return 'smooth';
        }
      })
    } catch (err) {}; // Edge throws an error
    return supports;
  }
  
  const hasNativeSmoothScroll = testSupportsSmoothScroll();
  
  function smoothScroll (node, topOrLeft, horizontal) {
    if (hasNativeSmoothScroll) {
      return node.scrollTo({
        [horizontal ? 'left' : 'top']: topOrLeft,
        behavior: 'smooth'
      })
    } else {
      return smoothScrollPolyfill(node, horizontal ? 'scrollLeft' : 'scrollTop', topOrLeft);
    }
  }
  
  function debounce(func, ms) {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null
        func()
      }, ms)
    }
  }
  
  const indicators = document.querySelectorAll('.indicator-button');
  const scroller = document.querySelector('.scroll');
  
  function setAriaLabels() {
    indicators.forEach((indicator, i) => {
      indicator.setAttribute('aria-label', `Scroll to item #${i + 1}`);
    })
  }
  
  function setAriaPressed(index) {
    indicators.forEach((indicator, i) => {
      indicator.setAttribute('aria-pressed', !!(i === index));
    })
  }
  
  indicators.forEach((indicator, i) => {
    indicator.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      setAriaPressed(i);
      const scrollLeft = Math.floor(scroller.scrollWidth * (i / 6));
      smoothScroll(scroller, scrollLeft, true);
    })
  })
  
  scroller.addEventListener('scroll', debounce(() => {
    let index = Math.round((scroller.scrollLeft / scroller.scrollWidth) * 6);
    setAriaPressed(index);
  }, 200))
  
  setAriaLabels();

/*Слайдер горизонтальный со стрелочками
let multiItemSlider = (function () {
  return function (selector) {
      let
      _mainElement = document.querySelector(selector), // основный элемент блока
      _sliderWrapper = _mainElement.querySelector('.slider_wrapper'), // обертка для .slider-item
      _sliderItems = _mainElement.querySelectorAll('.slider_item'), // элементы (.slider-item)
      _sliderControls = _mainElement.querySelectorAll('.slider_control'), // элементы управления
      _sliderControlLeft = _mainElement.querySelector('.slider_control_left'), // кнопка "LEFT"
      _sliderControlRight = _mainElement.querySelector('.slider_control_right'), // кнопка "RIGHT"
      _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width), // ширина обёртки
      _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width), // ширина одного элемента    
      _positionLeftItem = 0, // позиция левого активного элемента
      _transform = 0, // значение трансформации .slider_wrapper
      _step = _itemWidth / _wrapperWidth * 100, // величина шага (для трансформации)
      _items = []; // массив элементов
      
      // наполнение массива _items
      _sliderItems.forEach(function (item, index) {
      _items.push({ item: item, position: index, transform: 0 });
      });

      let position = {
      getMin: 0,
      getMax: _items.length - 1,
      }

      let _transformItem = function (direction) {
      if (direction === 'right') {
          if ((_positionLeftItem + _wrapperWidth / _itemWidth - 1) >= position.getMax) {
          return;
          }
          if (!_sliderControlLeft.classList.contains('slider_control_show')) {
          _sliderControlLeft.classList.add('slider_control_show');
          }
          if (_sliderControlRight.classList.contains('slider_control_show') && (_positionLeftItem + _wrapperWidth / _itemWidth) >= position.getMax) {
          _sliderControlRight.classList.remove('slider_control_show');
          }
          _positionLeftItem++;
          _transform -= _step;
      }
      if (direction === 'left') {
          if (_positionLeftItem <= position.getMin) {
          return;
          }
          if (!_sliderControlRight.classList.contains('slider_control_show')) {
          _sliderControlRight.classList.add('slider_control_show');
          }
          if (_sliderControlLeft.classList.contains('slider_control_show') && _positionLeftItem - 1 <= position.getMin) {
          _sliderControlLeft.classList.remove('slider_control_show');
          }
          _positionLeftItem--;
          _transform += _step;
      }
      _sliderWrapper.style.transform = 'translateX(' + _transform + '%)';
      }

      // обработчик события click для кнопок "назад" и "вперед"
      let _controlClick = function (e) {
      if (e.target.classList.contains('slider_control')) {
          e.preventDefault();
          var direction = e.target.classList.contains('slider_control_right') ? 'right' : 'left';
          _transformItem(direction);
      }
      };

      let _setUpListeners = function () {
      // добавление к кнопкам "назад" и "вперед" обработчика _controlClick для события click
      _sliderControls.forEach(function (item) {
          item.addEventListener('click', _controlClick);
      });
      }

      // инициализация
      _setUpListeners();

      return {
      right: function () { // метод right
          _transformItem('right');
      },
      left: function () { // метод left
          _transformItem('left');
      }
      }

  }
  }());

  let slider = multiItemSlider('.slider'); */

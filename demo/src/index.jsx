import React, { useEffect, useState, useRef } from 'react';
import { render } from 'react-dom';
import { MaskMixin } from '../../src/react';
import { InputMask } from '../../src/dom';
import './index.css';

window.addEventListener('DOMContentLoaded', () => {
  render(<App />, document.querySelector('#root'));
});

const variants = [
  {
    mask: '+7 (___) ___-__-__',
    label: 'Номер телефона',
    type: 'tel',
    id: 'phone',
  },
  {
    mask: '__ __ ______',
    label: 'Серия и номер паспорта',
  },
  {
    mask: '____ ____ ____ ____',
    label: 'Номер карты',
    autoComplete: 'cc-number',
  },
  {
    mask: '__ / __ / ____',
    label: 'Дата',
  },
];

const App = () => (
  <>
    <h3 data-primary>Vanilla JS solution</h3>
    {variants.map((variant, i) => (
      <DemoVanilla key={i} {...variant} />
    ))}

    <h3>React solution (component mixin)</h3>
    {variants.map((variant, i) => (
      <Demo key={i} {...variant} />
    ))}

    <h3>React solution with value prop change</h3>
    <DemoStateful
      mask='+7 (___) ___-__-__'
      label='Номер телефона'
    />
  </>
);

const DemoVanilla = ({ mask, label, ...inputProps }) => {
  const [inputMask, setInputMask] = useState();
  const ref = useRef();

  useEffect(() => {
    const m = InputMask(ref.current, {
      mask,
      onChange: data => console.log(data),
    });

    setInputMask(m);

    return () => m.disable();
  }, []);

  return (
    <div className='demo-block'>
      {label && (<label>{label}</label>)}
      <input
        ref={ref}
        placeholder={mask}
        {...inputProps}
      />
      <div className="controls">
        <button onClick={() => inputMask?.setValue('')}>Clean</button>
        <button onClick={() => inputMask?.setValue('0'.repeat(99))}>Fill by zero</button>
      </div>
    </div>
  );
};

const Demo = ({ mask, label }) => (
  <div className='demo-block'>
    {label && (<label>{label}</label>)}
    <MaskedInput maskOptions={{ mask }} placeholder={mask} />
  </div>
);

const DemoStateful = () => {
  const [value, setValue] = useState('');
  const [variantIndex, setVariantIndex] = useState(0);

  const { mask, label } = variants[variantIndex];

  return (
    <div className='demo-block'>
      {label && (<label>{label} (clean: "{value}")</label>)}
      <MaskedInput
        maskOptions={{ mask }}
        value={value}
        onChange={({ cleanValue }) => setValue(cleanValue)}
        placeholder={mask}
      />
      <div className="controls">
        <button onClick={() => setValue('')}>Clean</button>
        <button onClick={() => setVariantIndex((variantIndex + 1) % variants.length)}>Change mask</button>
      </div>
    </div>
  );
};

const MaskedInput = MaskMixin(props => (<input {...props} />));

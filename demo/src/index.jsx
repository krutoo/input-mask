import React, { useEffect, useState, useRef } from 'react';
import { render } from 'react-dom';
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
    <h2>JS input masks lib demo</h2>
    {variants.map((variant, i) => (
      <DemoVanilla key={i} {...variant} />
    ))}
  </>
);

const DemoVanilla = ({ mask, label, ...inputProps }) => {
  const [inputMask, setInputMask] = useState();
  const ref = useRef();

  useEffect(() => {
    const im = InputMask(ref.current, {
      mask,
      onChange: data => {
        console.log(data);
      },
    });

    setInputMask(im);

    return () => im.disable();
  }, []);

  return (
    <div className='demo-block'>
      {label && (<label>{label}</label>)}
      <input
        ref={ref}
        placeholder={mask}
        {...inputProps}
      />
      <div className='controls'>
        <button onClick={() => inputMask?.setValue('')}>Clean</button>
        <button onClick={() => inputMask?.setValue('0'.repeat(99))}>Fill by zero</button>
      </div>
    </div>
  );
};

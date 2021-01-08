import React, { useState } from 'react';
import { render } from 'react-dom';
import { MaskMixin } from '../../src/react';
import './index.css';

window.addEventListener('DOMContentLoaded', () => {
  render(<App />, document.querySelector('#root'));
});

const variants = [
  {
    mask: '+7 (___) ___-__-__',
    label: 'Номер телефона',
  },
  {
    mask: '__ __ ______',
    label: 'Серия и номер паспорта',
  },
  {
    mask: '____ ____ ____ ____',
    label: 'Номер карты',
  },
  {
    mask: '__ / __ / ____',
    label: 'Дата',
  },
];

const App = () => (
  <>
    <h2>Тесты масок (React)</h2>
    {variants.map((variant, i) => (
      <Demo key={i} {...variant} />
    ))}

    <h3>Stateful components (value change)</h3>
    <DemoStateful
      mask='+7 (___) ___-__-__'
      label='Номер телефона'
    />
  </>
);

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

import React from 'react';
import { render } from 'react-dom';
import { MaskMixin } from '../../src/react';
import './index.css';

window.addEventListener('DOMContentLoaded', () => {
  render(<App />, document.querySelector('#root'));
});

const App = () => (
  <>
    <h2>Тесты масок</h2>
    <DemoInput
      mask='+7 (___) ___-__-__'
      label='Номер телефона'
    />
    <DemoInput
      mask='__ __ ______'
      label='Серия и номер паспорта'
    />
    <DemoInput
      mask='____ ____ ____ ____'
      label='Номер карты'
    />
    <DemoInput
      mask='__ / __ / ____'
      label='Дата'
    />
  </>
);

const DemoInput = ({ mask, label }) => (
  <div className='demo-input'>
    {label && (<label>{label}</label>)}
    <MaskedInput maskOptions={{ mask }} placeholder={mask} />
  </div>
);

const MaskedInput = MaskMixin(props => (<input {...props} />));

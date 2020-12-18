import React, { useRef } from 'react';
import { render } from 'react-dom';
import { useInputMask } from '../src/hook';
import './index.css';

window.addEventListener('DOMContentLoaded', () => {
  render(<App />, document.querySelector('#root'));
});

const App = () => {
  const ref = useRef();

  useInputMask(ref, { mask: '+7 (___) ___-__-__' });


  return (
    <>
      <h2>Input mask test</h2>
      <input ref={ref} />
    </>
  );
};

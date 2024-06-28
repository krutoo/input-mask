import { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { type InputMaskControl, InputMask } from "../../src/dom/mod";
import "./index.css";

const variants = [
  {
    mask: "+7 (___) ___-__-__",
    label: "Russia phone number",
    inputProps: { type: "tel", id: "phone" },
  },
  {
    mask: "__ __ ______",
    label: "Russia series and number of passport",
  },
  {
    mask: "____ ____ ____ ____",
    label: "Credit card number",
    autoComplete: "cc-number",
  },
  {
    mask: "__ / __ / ____",
    label: "Date",
  },
];

function App() {
  return (
    <>
      <h2>JS input masks lib demo</h2>
      {variants.map((variant, i) => (
        <DemoBlock key={i} {...variant} />
      ))}
    </>
  );
}

function DemoBlock({
  mask,
  label,
  inputProps,
}: {
  mask: string;
  label: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}) {
  const [inputMask, setInputMask] = useState<InputMaskControl | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const im = InputMask(ref.current!, { mask });

    setInputMask(im);

    return () => {
      im.disable();
    };
  }, []);

  const clean = () => {
    inputMask?.setValue("");
  };

  const fillByZero = () => {
    inputMask?.setValue("0".repeat(99));
  };

  return (
    <div className="demo-block">
      <label>{label}</label>

      <input ref={ref} placeholder={mask} {...inputProps} />

      <div className="controls">
        <button type="button" onClick={clean}>
          Clean
        </button>

        <button type="button" onClick={fillByZero}>
          Fill by zero
        </button>
      </div>
    </div>
  );
}

createRoot(document.querySelector("#root")!).render(<App />);

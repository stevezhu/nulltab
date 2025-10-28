import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      onClick={() => {
        setCount((prev) => prev + 1);
      }}
    >
      Increment {count}
    </button>
  );
}

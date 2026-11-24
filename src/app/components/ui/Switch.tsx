import { useEffect, useState } from 'react';

const Switch = ({
  Checked, OnChecked
}: { Checked?: boolean, OnChecked?: (Checked: boolean) => void }) => {
    const [isChecked, setIsChecked] = useState(Checked || false);
    
    useEffect(() => { OnChecked?.(isChecked) }, [isChecked])

    return (<button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={() => setIsChecked(!isChecked)}
      className={`border border-muted/20 bg-linear-135 revert relative inline-flex h-6 w-10 items-center justify-start rounded-full p-0.5 transition-colors duration-300 ease-in-out cursor-pointer ${
        isChecked ? "from-primary to-secondary" : "from-s2 to-s2"
      }`}
    >
      <span
        className={`inline-block size-4.5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isChecked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>);
}

export default Switch;

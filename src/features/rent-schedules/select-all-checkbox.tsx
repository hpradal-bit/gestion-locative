"use client";

type SelectAllCheckboxProps = {
  /** name des checkboxes de lignes à cocher/décocher ensemble. */
  targetName: string;
};

export function SelectAllCheckbox({ targetName }: SelectAllCheckboxProps) {
  return (
    <input
      type="checkbox"
      aria-label="Tout sélectionner"
      className="size-4 accent-primary"
      onChange={(event) => {
        const checked = event.currentTarget.checked;
        const checkboxes = document.querySelectorAll<HTMLInputElement>(
          `input[type="checkbox"][name="${targetName}"]`
        );
        checkboxes.forEach((checkbox) => {
          checkbox.checked = checked;
        });
      }}
    />
  );
}

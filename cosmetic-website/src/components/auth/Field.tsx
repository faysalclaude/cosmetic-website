type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

export default function Field({ label, id, ...props }: Props) {
  const fieldId = id ?? props.name;
  return (
    <label htmlFor={fieldId} className="block text-sm font-medium">
      {label}
      <input
        id={fieldId}
        {...props}
        className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand disabled:bg-cream disabled:text-muted"
      />
    </label>
  );
}
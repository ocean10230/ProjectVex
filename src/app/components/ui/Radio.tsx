export function Radio({ selected }: { selected:boolean }) {
  return <div className={`size-3.5 rounded-full border-border flex items-center justify-center transition-colors duration-200 ${
        selected ? "bg-primary" : "bg-primary/0 border"
    }`}>
        <div className={`size-1.5 bg-white rounded-full transition-opacity duration-200 ${
            selected ? "opacity-100" : "opacity-0"
        }`}></div>
    </div>
}
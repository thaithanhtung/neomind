interface NodeTitleProps {
  label: string;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const NodeTitle = ({ label, selected, onMouseDown }: NodeTitleProps) => {
  return (
    <div
      className={`font-bold text-lg mb-3 text-gray-800 relative z-10 ${
        selected
          ? 'select-text cursor-text nodrag'
          : 'select-none cursor-move'
      }`}
      onMouseDown={onMouseDown}
    >
      {label}
    </div>
  );
};


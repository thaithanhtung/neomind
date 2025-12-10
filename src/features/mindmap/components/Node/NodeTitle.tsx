import { useUserSettings } from '@/shared/hooks/useUserSettings';

interface NodeTitleProps {
  label: string;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const NodeTitle = ({ label, selected, onMouseDown }: NodeTitleProps) => {
  const { settings } = useUserSettings();
  const headerColor = settings.uiConfig.nodeHeaderColor;

  return (
    <div
      className={`font-bold text-lg mb-3 relative z-10 ${
        selected ? 'select-text cursor-text nodrag' : 'select-none cursor-move'
      }`}
      style={{
        color: headerColor,
      }}
      onMouseDown={onMouseDown}
    >
      {label}
    </div>
  );
};

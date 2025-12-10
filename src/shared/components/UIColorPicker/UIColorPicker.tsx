import { Palette, Minus, Plus, Sparkles } from 'lucide-react';
import { UIConfig } from '@/shared/hooks/useUserSettings';
import {
  NODE_COLOR_TEMPLATES,
  getColorTemplateById,
} from '@/shared/utils/nodeColorTemplates';

interface UIColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export const UIColorPicker = ({
  label,
  value,
  onChange,
}: UIColorPickerProps) => {
  return (
    <div className='flex items-center gap-3'>
      <label className='text-sm font-medium text-gray-700 dark:text-gray-300 w-24'>
        {label}
      </label>
      <div className='flex items-center gap-2 flex-1'>
        <input
          type='color'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer'
        />
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
          placeholder='#6366f1'
        />
      </div>
    </div>
  );
};

interface UINumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export const UINumberInput = ({
  label,
  value,
  min = 1,
  max = 10,
  step = 1,
  onChange,
}: UINumberInputProps) => {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  return (
    <div className='flex items-center gap-3'>
      <label className='text-sm font-medium text-gray-700 dark:text-gray-300 w-24'>
        {label}
      </label>
      <div className='flex items-center gap-2 flex-1'>
        <button
          onClick={handleDecrease}
          disabled={value <= min}
          className='p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <Minus className='w-4 h-4' />
        </button>
        <input
          type='number'
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
        />
        <button
          onClick={handleIncrease}
          disabled={value >= max}
          className='p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <Plus className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
};

interface UISelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export const UISelect = ({
  label,
  value,
  options,
  onChange,
}: UISelectProps) => {
  return (
    <div className='flex items-center gap-3'>
      <label className='text-sm font-medium text-gray-700 dark:text-gray-300 w-24'>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface UIConfigPanelProps {
  config: UIConfig;
  onChange: (config: UIConfig) => void;
}

export const UIConfigPanel = ({ config, onChange }: UIConfigPanelProps) => {
  const updateConfig = (key: keyof UIConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const selectedTemplate = getColorTemplateById(config.nodeColorTemplate);

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 mb-4'>
        <Palette className='w-5 h-5 text-blue-600 dark:text-blue-400' />
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Cấu hình giao diện Mind Map
        </h3>
      </div>

      <div className='space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600'>
        <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
          Màu sắc đường kết nối
        </h4>
        <UIColorPicker
          label='Màu đường'
          value={config.edgeColor}
          onChange={(color) => updateConfig('edgeColor', color)}
        />
        <UINumberInput
          label='Độ dày'
          value={config.edgeWidth}
          min={1}
          max={10}
          step={1}
          onChange={(value) => updateConfig('edgeWidth', value)}
        />
      </div>

      <div className='space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600'>
        <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
          Nền Mind Map
        </h4>
        <UIColorPicker
          label='Màu nền'
          value={config.backgroundColor}
          onChange={(color) => updateConfig('backgroundColor', color)}
        />
        <UISelect
          label='Kiểu nền'
          value={config.backgroundVariant}
          options={[
            { value: 'dots', label: 'Chấm' },
            { value: 'lines', label: 'Đường kẻ' },
            { value: 'cross', label: 'Gạch chéo' },
          ]}
          onChange={(value) =>
            updateConfig(
              'backgroundVariant',
              value as UIConfig['backgroundVariant']
            )
          }
        />
      </div>

      <div className='space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600'>
        <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2'>
          <Sparkles className='w-4 h-4' />
          Màu sắc Node
        </h4>

        {/* Color Template Selector */}
        <div className='mb-4'>
          <label className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block'>
            Template màu sắc
          </label>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
            {NODE_COLOR_TEMPLATES.map((template) => {
              const isSelected = config.nodeColorTemplate === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => updateConfig('nodeColorTemplate', template.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                  }`}
                  title={template.description}
                >
                  <div className='flex flex-col gap-2'>
                    <div className='flex gap-1 justify-center'>
                      {template.colors.slice(0, 5).map((colorClass, idx) => {
                        // Extract colors from Tailwind classes
                        const getColorFromClass = (cls: string) => {
                          if (cls.includes('from-blue')) return '#dbeafe';
                          if (cls.includes('from-purple')) return '#faf5ff';
                          if (cls.includes('from-emerald')) return '#ecfdf5';
                          if (cls.includes('from-amber')) return '#fffbeb';
                          if (cls.includes('from-rose')) return '#fff1f2';
                          if (cls.includes('from-cyan')) return '#ecfeff';
                          if (cls.includes('from-violet')) return '#f5f3ff';
                          if (cls.includes('from-lime')) return '#f7fee7';
                          return '#f3f4f6';
                        };

                        const getToColor = (cls: string) => {
                          if (cls.includes('to-indigo')) return '#e0e7ff';
                          if (cls.includes('to-pink')) return '#fce7f3';
                          if (cls.includes('to-teal')) return '#f0fdfa';
                          if (cls.includes('to-orange')) return '#fff7ed';
                          if (cls.includes('to-pink')) return '#fce7f3';
                          if (cls.includes('to-blue')) return '#dbeafe';
                          if (cls.includes('to-fuchsia')) return '#fdf4ff';
                          if (cls.includes('to-green')) return '#f0fdf4';
                          return '#f3f4f6';
                        };

                        const fromColor = getColorFromClass(colorClass);
                        const toColor = getToColor(colorClass);

                        return (
                          <div
                            key={idx}
                            className='w-4 h-4 rounded border border-gray-300 dark:border-gray-600'
                            style={{
                              background: `linear-gradient(to bottom right, ${fromColor}, ${toColor})`,
                            }}
                          />
                        );
                      })}
                    </div>
                    <span
                      className={`text-xs font-medium text-center ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {template.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedTemplate && (
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
              {selectedTemplate.description}
            </p>
          )}
        </div>

        <UIColorPicker
          label='Viền node'
          value={config.nodeBorderColor}
          onChange={(color) => updateConfig('nodeBorderColor', color)}
        />
        <UIColorPicker
          label='Header node'
          value={config.nodeHeaderColor}
          onChange={(color) => updateConfig('nodeHeaderColor', color)}
        />
      </div>
    </div>
  );
};

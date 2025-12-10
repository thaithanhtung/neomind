/**
 * Color templates cho nodes theo level
 */

export interface NodeColorTemplate {
  id: string;
  name: string;
  description: string;
  colors: string[]; // Mảng các class màu cho từng level
}

export const NODE_COLOR_TEMPLATES: NodeColorTemplate[] = [
  {
    id: 'blue',
    name: 'Xanh dương',
    description: 'Tông màu xanh dương nhẹ nhàng',
    colors: [
      'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300',
      'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-400',
      'bg-gradient-to-br from-blue-200 to-indigo-200 border-blue-500',
      'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-400',
      'bg-gradient-to-br from-indigo-200 to-purple-200 border-indigo-500',
    ],
  },
  {
    id: 'purple',
    name: 'Tím',
    description: 'Tông màu tím sang trọng',
    colors: [
      'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300',
      'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400',
      'bg-gradient-to-br from-purple-200 to-pink-200 border-purple-500',
      'bg-gradient-to-br from-pink-100 to-rose-100 border-pink-400',
      'bg-gradient-to-br from-pink-200 to-rose-200 border-pink-500',
    ],
  },
  {
    id: 'green',
    name: 'Xanh lá',
    description: 'Tông màu xanh lá tươi mát',
    colors: [
      'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300',
      'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-400',
      'bg-gradient-to-br from-emerald-200 to-teal-200 border-emerald-500',
      'bg-gradient-to-br from-teal-100 to-cyan-100 border-teal-400',
      'bg-gradient-to-br from-teal-200 to-cyan-200 border-teal-500',
    ],
  },
  {
    id: 'orange',
    name: 'Cam',
    description: 'Tông màu cam ấm áp',
    colors: [
      'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300',
      'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-400',
      'bg-gradient-to-br from-amber-200 to-orange-200 border-amber-500',
      'bg-gradient-to-br from-orange-100 to-red-100 border-orange-400',
      'bg-gradient-to-br from-orange-200 to-red-200 border-orange-500',
    ],
  },
  {
    id: 'rose',
    name: 'Hồng',
    description: 'Tông màu hồng dịu dàng',
    colors: [
      'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300',
      'bg-gradient-to-br from-rose-100 to-pink-100 border-rose-400',
      'bg-gradient-to-br from-rose-200 to-pink-200 border-rose-500',
      'bg-gradient-to-br from-pink-100 to-fuchsia-100 border-pink-400',
      'bg-gradient-to-br from-pink-200 to-fuchsia-200 border-pink-500',
    ],
  },
  {
    id: 'cyan',
    name: 'Xanh ngọc',
    description: 'Tông màu xanh ngọc trong trẻo',
    colors: [
      'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300',
      'bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-400',
      'bg-gradient-to-br from-cyan-200 to-blue-200 border-cyan-500',
      'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-400',
      'bg-gradient-to-br from-blue-200 to-indigo-200 border-blue-500',
    ],
  },
  {
    id: 'violet',
    name: 'Tím hoa cà',
    description: 'Tông màu tím hoa cà thanh lịch',
    colors: [
      'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-300',
      'bg-gradient-to-br from-violet-100 to-purple-100 border-violet-400',
      'bg-gradient-to-br from-violet-200 to-purple-200 border-violet-500',
      'bg-gradient-to-br from-purple-100 to-fuchsia-100 border-purple-400',
      'bg-gradient-to-br from-purple-200 to-fuchsia-200 border-purple-500',
    ],
  },
  {
    id: 'lime',
    name: 'Xanh chanh',
    description: 'Tông màu xanh chanh tươi sáng',
    colors: [
      'bg-gradient-to-br from-lime-50 to-green-50 border-lime-300',
      'bg-gradient-to-br from-lime-100 to-green-100 border-lime-400',
      'bg-gradient-to-br from-lime-200 to-green-200 border-lime-500',
      'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400',
      'bg-gradient-to-br from-green-200 to-emerald-200 border-green-500',
    ],
  },
];

/**
 * Lấy template theo ID
 */
export const getColorTemplateById = (
  id: string
): NodeColorTemplate | undefined => {
  return NODE_COLOR_TEMPLATES.find((t) => t.id === id);
};

/**
 * Lấy template mặc định (blue)
 */
export const getDefaultColorTemplate = (): NodeColorTemplate => {
  return NODE_COLOR_TEMPLATES[0];
};

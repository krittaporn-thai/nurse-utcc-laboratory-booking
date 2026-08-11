import React from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { SelectedItem } from '../types';

interface Props {
  title: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  items: SelectedItem[];
  onChangeItems: (items: SelectedItem[]) => void;
  placeholderName?: string;
  placeholderUnit?: string;
  categoryLabel: string;
}

export const CustomItemSection: React.FC<Props> = ({
  title,
  icon,
  iconBgColor = 'bg-teal-50 text-teal-600',
  items,
  onChangeItems,
  placeholderName = 'ชื่อรายการ เช่น หุ่น CPR ผู้ใหญ่ / ถุงมือยาง',
  placeholderUnit = 'หน่วย เช่น ตัว / คู่ / กล่อง / ชิ้น',
  categoryLabel
}) => {
  const handleAddItem = () => {
    const newItem: SelectedItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: '',
      quantity: 1,
      unit: 'ชิ้น',
      availability: 'pending'
    };
    onChangeItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onChangeItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof SelectedItem, value: any) => {
    onChangeItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${iconBgColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {title}
            </h3>
            <p className="text-[11px] text-slate-400">
              กดปุ่ม "+ เพิ่มรายการ" เพื่อระบุรายการ{categoryLabel}ที่ต้องการด้วยตนเอง
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>+ เพิ่มรายการ</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-xs">
          ยังไม่มีรายการ{categoryLabel} (กด "+ เพิ่มรายการ" เพื่อระบุรายการ)
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
            >
              {/* Item Name */}
              <div className="sm:col-span-6">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  ชื่อรายการ #{index + 1}
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                  placeholder={placeholderName}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Quantity */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  จำนวน
                </label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-center text-slate-900 dark:text-white font-bold"
                />
              </div>

              {/* Unit */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  หน่วยนับ
                </label>
                <input
                  type="text"
                  value={item.unit || ''}
                  onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                  placeholder={placeholderUnit}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              {/* Delete Button */}
              <div className="sm:col-span-1 flex justify-end sm:justify-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  title="ลบรายการนี้"
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

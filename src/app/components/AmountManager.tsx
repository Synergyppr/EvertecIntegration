'use client';

import { useState } from 'react';
import type { TransactionAmounts } from '../types/evertec-ecr';

interface AmountManagerProps {
  currentAmounts: TransactionAmounts;
  onAmountsUpdate: (amounts: TransactionAmounts) => void;
  onClose: () => void;
}

export function AmountManager({ currentAmounts, onAmountsUpdate, onClose }: AmountManagerProps) {
  const [amounts, setAmounts] = useState<TransactionAmounts>({
    total: currentAmounts.total || '0.00',
    base_state_tax: currentAmounts.base_state_tax || '0.00',
    base_reduced_tax: currentAmounts.base_reduced_tax || '0.00',
    tip: currentAmounts.tip || '0.00',
    state_tax: currentAmounts.state_tax || '0.00',
    reduced_tax: currentAmounts.reduced_tax || '0.00',
    city_tax: currentAmounts.city_tax || '0.00',
    cashback: currentAmounts.cashback || '0.00',
  });

  const handleChange = (field: keyof TransactionAmounts, value: string) => {
    setAmounts(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    // Remove cashback if it's 0.00
    const finalAmounts = { ...amounts };
    if (parseFloat(finalAmounts.cashback || '0') === 0) {
      delete finalAmounts.cashback;
    }
    onAmountsUpdate(finalAmounts);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">💰 Manage Amounts</h2>
              <p className="text-blue-100 text-sm">Configure transaction amount breakdown</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-600 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Amount Inputs */}
        <div className="p-6 space-y-4">
          {/* Total Amount - Highlighted */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4">
            <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
              Total Amount *
            </label>
            <input
              type="number"
              step="0.01"
              value={amounts.total}
              onChange={(e) => handleChange('total', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-4 text-2xl font-bold border-2 border-blue-400 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="0.00"
              autoFocus
            />
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
              The final total amount for this transaction
            </p>
          </div>

          {/* Tax Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base State Tax */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Base State Tax
              </label>
              <input
                type="number"
                step="0.01"
                value={amounts.base_state_tax}
                onChange={(e) => handleChange('base_state_tax', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Base amount for standard state tax
              </p>
            </div>

            {/* State Tax */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                State Tax
              </label>
              <input
                type="number"
                step="0.01"
                value={amounts.state_tax}
                onChange={(e) => handleChange('state_tax', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Calculated state tax amount
              </p>
            </div>

            {/* Base Reduced Tax */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Base Reduced Tax
              </label>
              <input
                type="number"
                step="0.01"
                value={amounts.base_reduced_tax}
                onChange={(e) => handleChange('base_reduced_tax', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Base amount for reduced state tax
              </p>
            </div>

            {/* Reduced Tax */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Reduced Tax
              </label>
              <input
                type="number"
                step="0.01"
                value={amounts.reduced_tax}
                onChange={(e) => handleChange('reduced_tax', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Calculated reduced tax amount
              </p>
            </div>

            {/* City Tax */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                City Tax
              </label>
              <input
                type="number"
                step="0.01"
                value={amounts.city_tax}
                onChange={(e) => handleChange('city_tax', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                City tax amount
              </p>
            </div>

            {/* Tip */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Tip
              </label>
              <input
                type="number"
                step="0.01"
                value={amounts.tip}
                onChange={(e) => handleChange('tip', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Optional tip amount
              </p>
            </div>

            {/* Cashback */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Cashback
              </label>
              <input
                type="number"
                step="0.01"
                value={amounts.cashback}
                onChange={(e) => handleChange('cashback', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Optional cashback amount
              </p>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-xs text-yellow-800 dark:text-yellow-300">
                <p className="font-semibold mb-1">Puerto Rico Tax Compliance:</p>
                <p>When using tax fields, you must provide both base amounts AND calculated taxes. If you have no reduced tax items, set both base_reduced_tax and reduced_tax to "0.00".</p>
              </div>
            </div>
          </div>

          {/* Current Values Preview */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
              Current Amount Object
            </h4>
            <pre className="text-xs font-mono bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600 overflow-x-auto">
{JSON.stringify(
  {
    total: amounts.total,
    base_state_tax: amounts.base_state_tax,
    base_reduced_tax: amounts.base_reduced_tax,
    tip: amounts.tip,
    state_tax: amounts.state_tax,
    reduced_tax: amounts.reduced_tax,
    city_tax: amounts.city_tax,
    ...(parseFloat(amounts.cashback || '0') > 0 && { cashback: amounts.cashback }),
  },
  null,
  2
)}
            </pre>
          </div>

          {/* Keyboard Hint */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Enter</kbd> from any field to apply changes and close the modal.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-6 rounded-b-lg border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Apply Amounts
          </button>
        </div>
      </div>
    </div>
  );
}

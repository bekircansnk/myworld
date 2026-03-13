import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Tamam',
  cancelText = 'İptal',
  variant = 'destructive'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-0">
        <div className="p-6">
          <DialogHeader className="flex flex-col items-center text-center space-y-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'destructive' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl text-slate-900 dark:text-white font-bold">{title}</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end items-center">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl px-6">
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }} 
            className={`rounded-2xl px-6 shadow-sm ${variant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PlusCircle } from 'lucide-react';
import { COMMON_ISSUES } from '../constants';

interface IssueModalProps {
  show: boolean;
  onClose: () => void;
  onLogIssue: (type: string) => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ show, onClose, onLogIssue }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/60 backdrop-blur-sm p-0"
        >
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#F8FAFC]">
              <h3 className="text-lg font-bold text-[#1E293B]">Registrar Fato</h3>
              <button onClick={onClose} className="p-2 bg-white border border-black/5 rounded-full text-black/40">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 bg-white flex-1">
              {COMMON_ISSUES.map(issue => (
                <button 
                  key={issue} 
                  onClick={() => onLogIssue(issue)} 
                  className="w-full text-left p-4 rounded-2xl border border-black/5 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm font-bold text-[#1E293B]">{issue}</span>
                  <PlusCircle size={18} className="text-black/10 group-hover:text-emerald-500" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

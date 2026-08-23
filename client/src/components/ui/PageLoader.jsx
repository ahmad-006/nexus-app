import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8F9FA]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative flex items-center justify-center">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-15px] rounded-full border border-slate-200 border-t-slate-400"
          />
          {/* Inner pulsing Hexagon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Hexagon className="h-10 w-10 text-slate-900" strokeWidth={2} />
          </motion.div>
        </div>
        
        {/* Loading text */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="font-serif text-xl font-bold tracking-widest text-slate-900 uppercase">
            Nexus
          </span>
          <span className="text-xs font-medium tracking-widest text-slate-400 uppercase">
            Loading Workspace
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PageLoader;

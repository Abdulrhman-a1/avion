import { motion } from 'framer-motion';

export default function QuickChips({ items, onSelect, variant = 'category' }) {
  const isCategory = variant === 'category';

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item, i) => (
        <motion.button
          key={item.id || item}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(item)}
          className={`
            text-xs rounded-xl transition-all duration-200 cursor-pointer
            ${isCategory
              ? 'px-4 py-2.5 bg-turquoise/15 border-2 border-turquoise text-turquoise font-[League_Spartan] font-semibold hover:bg-turquoise/25'
              : 'px-4 py-2.5 bg-white/[0.04] border-2 border-white/[0.08] text-muted hover:border-turquoise hover:text-turquoise text-left max-w-full'
            }
          `}
        >
          {isCategory ? item : item.question}
        </motion.button>
      ))}
    </div>
  );
}

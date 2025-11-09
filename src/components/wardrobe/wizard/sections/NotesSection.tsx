/**
 * NotesSection Component
 * Brand and Notes fields
 */

import { motion } from "framer-motion";
import { FORM_ANIMATIONS } from "../form-config";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export function NotesSection({}: NotesSectionProps) {
  return (
    <motion.div variants={FORM_ANIMATIONS.item}>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">
          Additional Info
        </h3>

        <div className="space-y-4">
          {/* Notes */}
          {/* <div>
            <Label
              htmlFor={FORM_FIELDS.NOTES.id}
              className="text-sm font-semibold text-white/90 mb-2"
            >
              {FORM_FIELDS.NOTES.label}
            </Label>
            <Textarea
              id={FORM_FIELDS.NOTES.id}
              value={notes || ""}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={FORM_FIELDS.NOTES.rows}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-transparent focus:bg-white/15 transition-all resize-none"
              placeholder={FORM_FIELDS.NOTES.placeholder}
            />
          </div> */}
        </div>
      </div>
    </motion.div>
  );
}

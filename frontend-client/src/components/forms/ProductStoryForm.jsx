/**
 * Guided questionnaire for product story.
 * Renders 5 simple questions that feel like a conversation, not a form.
 * Returns a `story` object via onChange.
 */

const PROCESS_OPTIONS = [
  'A mano', 'Tejido', 'Tallado', 'Bordado', 'Cosido',
  'Fundido', 'Pintado', 'Torneado', 'Otro',
];

const TIME_OPTIONS = [
  { value: 'menos de 1 día', label: 'Menos de 1 día' },
  { value: '1-3 días', label: '1 a 3 días' },
  { value: '1 semana', label: '1 semana' },
  { value: '2 semanas', label: '2 semanas' },
  { value: '1 mes o más', label: '1 mes o más' },
];

function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
        selected
          ? 'bg-accent text-primary border-accent'
          : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent'
      }`}
    >
      {label}
    </button>
  );
}

function Step({ number, question, hint, children, filled }) {
  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${filled ? 'border-accent/40 bg-accent/5' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5 ${filled ? 'bg-accent text-primary' : 'bg-gray-100 text-gray-500'}`}>
          {filled ? '✓' : number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 mb-0.5">{question}</p>
          {hint && <p className="text-xs text-gray-400 mb-3">{hint}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProductStoryForm({ value = {}, onChange, errors = {} }) {
  const set = (key, val) => onChange({ ...value, [key]: val });

  return (
    <div className="space-y-3">
      {/* Step 1 – Materials */}
      <Step
        number="1"
        question="¿Con qué está hecho?"
        hint="Ej: Cuero natural, madera de cedro, lana merino, cerámica..."
        filled={!!value.materials}
      >
        <input
          type="text"
          value={value.materials || ''}
          onChange={(e) => set('materials', e.target.value)}
          placeholder="Escribe los materiales principales..."
          className={`input-field w-full ${errors.materials ? 'border-red-400' : ''}`}
          maxLength={200}
        />
        {errors.materials && <p className="text-xs text-red-500 mt-1">{errors.materials}</p>}
      </Step>

      {/* Step 2 – Process (chips) */}
      <Step
        number="2"
        question="¿Cómo se elabora?"
        hint="Selecciona el método principal de fabricación"
        filled={!!value.process}
      >
        <div className="flex flex-wrap gap-2">
          {PROCESS_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              label={opt}
              selected={value.process === opt}
              onClick={() => set('process', opt)}
            />
          ))}
        </div>
        {value.process === 'Otro' && (
          <input
            type="text"
            value={value.process_custom || ''}
            onChange={(e) => {
              set('process', e.target.value || 'Otro');
              set('process_custom', e.target.value);
            }}
            placeholder="Describe el proceso..."
            className="input-field w-full mt-2"
            maxLength={100}
          />
        )}
        {errors.process && <p className="text-xs text-red-500 mt-1">{errors.process}</p>}
      </Step>

      {/* Step 3 – Time (pills) */}
      <Step
        number="3"
        question="¿Cuánto tiempo tarda hacerlo?"
        hint="Tiempo aproximado de fabricación de una unidad"
        filled={!!value.time}
      >
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={value.time === opt.value}
              onClick={() => set('time', opt.value)}
            />
          ))}
        </div>
        {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
      </Step>

      {/* Step 4 – Ideal for */}
      <Step
        number="4"
        question="¿Para quién es ideal este producto?"
        hint="Ej: Amantes del diseño artesanal, personas que buscan regalos únicos..."
        filled={!!value.ideal_for}
      >
        <input
          type="text"
          value={value.ideal_for || ''}
          onChange={(e) => set('ideal_for', e.target.value)}
          placeholder="Describe tu cliente ideal..."
          className={`input-field w-full ${errors.ideal_for ? 'border-red-400' : ''}`}
          maxLength={200}
        />
        {errors.ideal_for && <p className="text-xs text-red-500 mt-1">{errors.ideal_for}</p>}
      </Step>

      {/* Step 5 – Unique factor */}
      <Step
        number="5"
        question="¿Qué lo hace único o especial?"
        hint="Máximo 2-3 oraciones. ¡Esto es lo que más conecta con el comprador!"
        filled={!!value.unique}
      >
        <textarea
          value={value.unique || ''}
          onChange={(e) => set('unique', e.target.value)}
          placeholder="Cuéntanos qué lo diferencia de los demás..."
          className={`input-field w-full resize-none ${errors.unique ? 'border-red-400' : ''}`}
          rows={2}
          maxLength={300}
        />
        <p className="text-xs text-gray-400 text-right mt-1">{(value.unique || '').length}/300</p>
        {errors.unique && <p className="text-xs text-red-500 mt-1">{errors.unique}</p>}
      </Step>
    </div>
  );
}

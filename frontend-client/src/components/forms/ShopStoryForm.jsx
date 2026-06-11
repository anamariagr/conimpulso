/**
 * Guided questionnaire for shop/business story.
 * 4 conversational questions about the entrepreneur's journey.
 */

const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

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

export default function ShopStoryForm({ value = {}, onChange, errors = {} }) {
  const set = (key, val) => onChange({ ...value, [key]: val });

  return (
    <div className="space-y-3">
      {/* Step 1 – What you do */}
      <Step
        number="1"
        question="¿Qué hace tu emprendimiento?"
        hint="Describe brevemente qué vendes o fabricas"
        filled={!!value.what_we_do}
      >
        <input
          type="text"
          value={value.what_we_do || ''}
          onChange={(e) => set('what_we_do', e.target.value)}
          placeholder="Ej: Fabricamos muebles de madera reciclada hechos a mano..."
          className={`input-field w-full ${errors.what_we_do ? 'border-red-400' : ''}`}
          maxLength={200}
        />
        {errors.what_we_do && <p className="text-xs text-red-500 mt-1">{errors.what_we_do}</p>}
      </Step>

      {/* Step 2 – Founded year + location */}
      <Step
        number="2"
        question="¿Cuándo y dónde empezaste?"
        hint="Año de inicio y ciudad donde operas"
        filled={!!(value.founded_year && value.location)}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Año de inicio</label>
            <select
              value={value.founded_year || ''}
              onChange={(e) => set('founded_year', e.target.value)}
              className={`input-field w-full ${errors.founded_year ? 'border-red-400' : ''}`}
            >
              <option value="">Seleccionar...</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {errors.founded_year && <p className="text-xs text-red-500 mt-1">{errors.founded_year}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ciudad</label>
            <input
              type="text"
              value={value.location || ''}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Ej: Bogotá, Medellín..."
              className={`input-field w-full ${errors.location ? 'border-red-400' : ''}`}
              maxLength={100}
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>
        </div>
      </Step>

      {/* Step 3 – Why you started */}
      <Step
        number="3"
        question="¿Por qué lo creaste?"
        hint="Tu historia o motivación. Esta es la parte más humana y conecta con los compradores"
        filled={!!value.why_started}
      >
        <textarea
          value={value.why_started || ''}
          onChange={(e) => set('why_started', e.target.value)}
          placeholder="Ej: Lo empecé porque quería rescatar las técnicas de mi abuela y darles un nuevo mercado..."
          className={`input-field w-full resize-none ${errors.why_started ? 'border-red-400' : ''}`}
          rows={2}
          maxLength={300}
        />
        <p className="text-xs text-gray-400 text-right mt-1">{(value.why_started || '').length}/300</p>
        {errors.why_started && <p className="text-xs text-red-500 mt-1">{errors.why_started}</p>}
      </Step>

      {/* Step 4 – Differentiator */}
      <Step
        number="4"
        question="¿Qué te diferencia de otros?"
        hint="Ej: Cada pieza lleva el nombre del artesano, usamos materiales 100% reciclados..."
        filled={!!value.differentiator}
      >
        <textarea
          value={value.differentiator || ''}
          onChange={(e) => set('differentiator', e.target.value)}
          placeholder="Tu ventaja única frente a la competencia..."
          className={`input-field w-full resize-none ${errors.differentiator ? 'border-red-400' : ''}`}
          rows={2}
          maxLength={300}
        />
        <p className="text-xs text-gray-400 text-right mt-1">{(value.differentiator || '').length}/300</p>
        {errors.differentiator && <p className="text-xs text-red-500 mt-1">{errors.differentiator}</p>}
      </Step>
    </div>
  );
}

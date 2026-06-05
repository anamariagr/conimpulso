import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: '¿Qué deseas hacer?',
    subtitle: 'Selecciona tu objetivo principal',
    type: 'single',
    options: [
      { value: 'sell_products', label: 'Vender productos', icon: '📦' },
      { value: 'sell_services', label: 'Ofrecer servicios', icon: '🔧' },
      { value: 'both', label: 'Productos y servicios', icon: '🏪' },
      { value: 'buy', label: 'Solo comprar', icon: '🛒' },
    ],
  },
  {
    id: 2,
    title: '¿Fabricas directamente?',
    subtitle: '¿Producés tus propios productos?',
    type: 'single',
    skipIf: (answers) => ['buy'].includes(answers[1]), // Skip if user selected "only buy"
    options: [
      { value: 'yes_manufacturer', label: 'Sí, soy fabricante', icon: '🏭' },
      { value: 'yes_artisan', label: 'Sí, soy artesano', icon: '🎨' },
      { value: 'no_reseller', label: 'No, revendo productos', icon: '📱' },
    ],
  },
  {
    id: 3,
    title: '¿Vendes al por mayor?',
    subtitle: '¿Ofreces precios especiales por cantidad?',
    type: 'single',
    skipIf: (answers) => ['buy'].includes(answers[1]), // Skip if user selected "only buy"
    options: [
      { value: 'wholesale_only', label: 'Solo al por mayor', icon: '📊' },
      { value: 'retail_only', label: 'Solo al detal', icon: '🛍️' },
      { value: 'both_prices', label: 'Ambos precios', icon: '⚖️' },
    ],
  },
  {
    id: 4,
    title: '¿Realizas envíos?',
    subtitle: '¿Cómo entregás tus productos?',
    type: 'multiple',
    skipIf: (answers) => ['buy'].includes(answers[1]), // Skip if user selected "only buy"
    options: [
      { value: 'local_pickup', label: 'Recogida local', icon: '📍' },
      { value: 'courier', label: 'Courier propio', icon: '🚚' },
      { value: 'logistics', label: 'Integración logística', icon: '📬' },
      { value: 'digital', label: 'Entrega digital', icon: '💾' },
    ],
  },
  {
    id: 5,
    title: '¿Qué categorías te interesan?',
    subtitle: 'Selecciona todas las que apliquen',
    type: 'multiple',
    options: [
      { value: 'food', label: 'Alimentos y bebidas', icon: '🍽️' },
      { value: 'textile', label: 'Textiles y ropa', icon: '👕' },
      { value: 'crafts', label: 'Artesanía', icon: '🎨' },
      { value: 'tech', label: 'Tecnología', icon: '💻' },
      { value: 'furniture', label: 'Muebles', icon: '🪑' },
      { value: 'metal', label: 'Metalurgia', icon: '⚙️' },
      { value: 'services', label: 'Servicios', icon: '🔧' },
      { value: 'other', label: 'Otros', icon: '📦' },
    ],
  },
  {
    id: 6,
    title: '¡Listo!',
    subtitle: 'Tu cuenta está configurada',
    type: 'complete',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const isBuyerOnly = answers[1] === 'buy';

  // Get visible steps based on answers
  const getVisibleSteps = () => {
    return steps.filter((step) => {
      if (step.skipIf) return !step.skipIf(answers);
      return true;
    });
  };

  const visibleSteps = getVisibleSteps();
  const currentStep = visibleSteps[currentStepIndex];
  const isLastStep = currentStepIndex === visibleSteps.length - 2;
  const isComplete = currentStepIndex === visibleSteps.length - 1;

  // Handle single selection
  const handleSingleSelect = (value) => {
    setAnswers({ ...answers, [currentStep.id]: value });

    if (!isLastStep) {
      // Move to next step index
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Go to complete step
      setCurrentStepIndex(visibleSteps.length - 1);
    }
  };

  const handleMultipleToggle = (value) => {
    const current = answers[currentStep.id] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [currentStep.id]: updated });
  };

  const handleNext = () => {
    if (isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1);
  };

  const handleFinish = () => {
    console.log('Onboarding completed with:', answers);
    toast.success('¡Perfil configurado exitosamente!');
    navigate('/dashboard');
  };

  const canProceed = () => {
    if (currentStep.type === 'complete') return true;
    const answer = answers[currentStep.id];
    if (Array.isArray(answer)) return answer.length > 0;
    return !!answer;
  };

  if (isComplete || !currentStep) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="card max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">¡Bienvenido a NexusLab!</h1>
          <p className="text-text-secondary mb-8">
            Tu cuenta ha sido configurada correctamente. Ahora puedes empezar a explorar y usar la plataforma.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={handleFinish} className="btn-primary">
              Ir al dashboard
            </button>
            <button onClick={() => navigate('/')} className="btn-outline">
              Explorar la plataforma
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {visibleSteps.slice(0, -1).map((s, i) => (
            <div
              key={s.id}
              className={`flex-1 h-2 rounded-full ${
                i <= currentStepIndex ? 'bg-accent' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="card mb-6">
          <h1 className="text-2xl font-bold text-primary mb-2">{currentStep.title}</h1>
          <p className="text-text-secondary mb-6">{currentStep.subtitle}</p>

          <div className={`grid gap-3 ${currentStep.type === 'single' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            {currentStep.options?.map((option) => {
              const isSelected = currentStep.type === 'multiple'
                ? (answers[currentStep.id] || []).includes(option.value)
                : answers[currentStep.id] === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() =>
                    currentStep.type === 'multiple'
                      ? handleMultipleToggle(option.value)
                      : handleSingleSelect(option.value)
                  }
                  className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                    isSelected
                      ? 'border-accent bg-accent/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl mb-2 block">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                  {isSelected && (
                    <Check className="w-5 h-5 text-accent absolute top-3 right-3" />
                  )}
                </button>
              );
            })}
          </div>

          {isBuyerOnly && currentStepIndex === 1 && (
            <p className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Como comprador, puedes explorar productos de vendedores directos sin preocuparte por envíos o precios al por mayor.
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="btn-outline flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" /> Anterior
          </button>

          {currentStep.type === 'multiple' && (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              Siguiente <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
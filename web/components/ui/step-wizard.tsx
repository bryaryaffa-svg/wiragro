export function StepWizard({
  steps,
}: {
  steps: Array<{
    description: string;
    label: string;
    status?: "complete" | "current" | "upcoming";
  }>;
}) {
  return (
    <ol className="step-wizard" aria-label="Alur langkah">
      {steps.map((step, index) => (
        <li
          className={`step-wizard__item step-wizard__item--${step.status ?? "upcoming"}`}
          key={`${step.label}-${index}`}
        >
          <span className="step-wizard__index">{index + 1}</span>
          <div>
            <strong>{step.label}</strong>
            <span>{step.description}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

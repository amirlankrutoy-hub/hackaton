"use client";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import Certificate from "@/components/game/Certificate";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { getSubject } from "@/lib/content";

export default function CertificatePage() {
  const { subjectId } = useParams();
  const { state } = useGame();
  const subject = getSubject(subjectId);
  const exam = state.exams[subjectId];
  if (!subject || !exam?.passed) {
    return (
      <EmptyState emoji="📜" title="Сертификата пока нет" text="Сертификат выдаётся после успешной сдачи итоговой контрольной (от 80%).">
        <Button href={subject ? `/subjects/${subjectId}` : "/lessons"} className="mt-3">
          К предмету
        </Button>
      </EmptyState>
    );
  }
  return (
    <div>
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button href={`/exam/${subjectId}`} variant="ghost">
          <ArrowLeft size={18} /> Назад
        </Button>
        <Button onClick={() => window.print()} variant="secondary">
          <Printer size={18} /> Распечатать / сохранить PDF
        </Button>
      </div>
      <Certificate name={state.profile.name} subject={subject} percent={exam.bestPercent} date={exam.passedAt} />
      <p className="no-print mt-4 text-center text-xs text-slate-400">Сертификат подтверждает прохождение курса на платформе EduQuest и не является официальным документом об образовании.</p>
    </div>
  );
}

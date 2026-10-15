import type { Advisor } from "@/db";
import { saveAdvisor } from "@/lib/actions";
import { DeleteAdvisor } from "./DeleteAdvisor";

export function AdvisorForm({ advisor }: { advisor?: Advisor }) {
  return (
    <form action={saveAdvisor} className="card space-y-4 p-5">
      {advisor && <input type="hidden" name="id" value={advisor.id} />}
      <div className="grid gap-4 sm:grid-cols-[90px_1fr_1fr]">
        <div>
          <label className="label">Эмодзи</label>
          <input name="emoji" defaultValue={advisor?.emoji ?? "🎓"} className="input text-center text-xl" maxLength={8} />
        </div>
        <div>
          <label className="label">Имя</label>
          <input name="name" required defaultValue={advisor?.name} className="input" placeholder="Например: IT-директор" />
        </div>
        <div>
          <label className="label">Роль</label>
          <input name="title" required defaultValue={advisor?.title} className="input" placeholder="Цифровизация и автоматизация" />
        </div>
      </div>
      {!advisor && (
        <div>
          <label className="label">Код (латиницей, для адреса страницы)</label>
          <input name="slug" className="input" placeholder="cto" pattern="[a-z0-9-]{2,40}" />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Сфера</label>
          <select name="category" defaultValue={advisor?.category ?? "business"} className="input" disabled={advisor?.isChair}>
            <option value="business">Бизнес</option>
            <option value="life">Жизнь</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-ink-700">
          <input type="checkbox" name="enabled" defaultChecked={advisor?.enabled ?? true} className="accent-ink-900" />
          Участвует в заседаниях совета
        </label>
      </div>
      <div>
        <label className="label">Краткое описание</label>
        <input name="description" defaultValue={advisor?.description} className="input" />
      </div>
      <div>
        <label className="label">Характер и экспертиза (инструкция для ИИ)</label>
        <textarea name="persona" required defaultValue={advisor?.persona} rows={16} className="input font-mono text-xs leading-relaxed" />
        <p className="mt-1 text-xs text-ink-400">Опишите, кто этот советник, за что отвечает, его принципы и стиль общения.</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-primary">Сохранить</button>
        {advisor && !advisor.isChair && <DeleteAdvisor id={advisor.id} />}
      </div>
    </form>
  );
}

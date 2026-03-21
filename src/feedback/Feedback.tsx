import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IconCheck, IconAlertTriangle } from '@tabler/icons-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PageLayout, SectionCard } from '@/components/common/PageLayout'
import { getContent, detectLanguage } from './content'

const GOOGLE_FORM = {
  actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeUEkOMxPNJKk0fwvlLq_KGfMTBJ1GJcOyEM6yCUKWf259ISA/formResponse',
  fields: {
    category: 'entry.1375145178',
    description: 'entry.1877139816',
    email: 'entry.1822886614',
  },
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export const Feedback: React.FC = () => {
  const [lang, setLang] = useState(detectLanguage)
  const t = getContent(lang)

  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const canSubmit = category && description.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !formRef.current) return

    setFormState('submitting')
    formRef.current.submit()

    // iframe submit has no callback, wait briefly then show success
    setTimeout(() => setFormState('success'), 1500)
  }

  const handleReset = () => {
    setCategory('')
    setDescription('')
    setEmail('')
    setFormState('idle')
  }

  return (
    <>
      <PageHeader
        activePage="feedback"
        lang={lang}
        onLangChange={setLang}
      />
      <PageLayout>
        {formState === 'success' ? (
          <SectionCard>
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <IconCheck size={24} />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{t.success.title}</h2>
                <p className="text-sm text-muted-foreground">{t.success.message}</p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                {t.success.another}
              </Button>
            </div>
          </SectionCard>
        ) : formState === 'error' ? (
          <SectionCard>
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <IconAlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{t.error.title}</h2>
                <p className="text-sm text-muted-foreground">{t.error.message}</p>
              </div>
              <Button variant="outline" onClick={() => setFormState('idle')}>
                {t.error.retry}
              </Button>
            </div>
          </SectionCard>
        ) : (
          <>
            <iframe ref={iframeRef} name="hidden_iframe" className="hidden" />
            <form
              ref={formRef}
              action={GOOGLE_FORM.actionUrl}
              method="POST"
              target="hidden_iframe"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name={GOOGLE_FORM.fields.category} value={category} />
              <input type="hidden" name={GOOGLE_FORM.fields.description} value={description} />
              <input type="hidden" name={GOOGLE_FORM.fields.email} value={email} />

              <SectionCard>
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold">{t.pageTitle}</h2>

                  <Field>
                    <FieldLabel htmlFor="category">{t.form.category.label}</FieldLabel>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="bg-background">
                        <SelectValue placeholder={t.form.category.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(t.form.category.options).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">{t.form.description.label}</FieldLabel>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t.form.description.placeholder}
                      rows={5}
                      className="bg-background resize-none"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">{t.form.email.label}</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.form.email.placeholder}
                      className="bg-background"
                    />
                    <FieldDescription>{t.form.email.description}</FieldDescription>
                  </Field>
                </div>
              </SectionCard>

              <div className="mt-4">
                <Button
                  type="submit"
                  disabled={!canSubmit || formState === 'submitting'}
                  className="w-full h-11 text-base font-medium"
                >
                  {formState === 'submitting' ? t.form.submitting : t.form.submit}
                </Button>
              </div>
            </form>
          </>
        )}
      </PageLayout>
    </>
  )
}

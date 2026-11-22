'use client';

import Image from 'next/image';
import { type MouseEvent, useRef } from 'react';
import siteLogo from './site-logo.png';

const LETTER_PARAGRAPHS = [
  '당신은 좋아하는 캐릭터가 있나요? \n최근에는 치이카와가 창궐하여 모든 게 "우나~!", "뿌릿", "히야~!"로 범벅이 되고 있습니다. 그러나 근-본은 포켓몬과 디지몬이라고 생각합니다.',
  '디지몬은... 아픈 추억이 있기에 그리 달갑진 않습니다. 잼민이 시절 디지몬 게임을 하려고 컴퓨터 옆에 줄을 섰지만, 영원히 비켜 주지 않는 집안의 어떤 연장자에 의해 멀어지게 되었습니다. 그리곤 닌텐도로 피신했죠... 그렇게 디아루가와 펄기아를 사랑하게 되었어요. (현 최애는 파오리)',
  '여러분은 어떤 캐릭터를 좋아하시나요? 귀여운 건 정신 건강에 매우 좋습니다. 감히 추천드리자면, 좋아하는 걸 꼬옥 마음에 품고 지내 보세요.',
  '방문해 주셔서 감사합니다. 즐거운 하루 되십쇼.',
];

const LETTER_POSTSCRIPT = 'ps. 파오리에게는 창파나이트라는 진화형도 있다.';

/** 모달 바깥(배경)을 눌렀을 때만 닫는다. 안쪽 내용을 누르면 target 이 dialog 가 아니다 */
function closeOnBackdropClick(event: MouseEvent<HTMLDialogElement>) {
  if (event.target === event.currentTarget) event.currentTarget.close();
}

/** 푸터 저작권 옆 작은 파오리. 누르면 이스터에그 모달이 열린다 */
export function PaoriEasterEgg() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="파오리"
        aria-haspopup="dialog"
        className="inline-flex size-6 items-center justify-center rounded-sm hover:bg-surface"
      >
        <Image
          src={siteLogo}
          alt=""
          width={16}
          height={16}
          className="[image-rendering:pixelated]"
        />
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 배경 클릭 닫기는 마우스 보조 수단. 키보드는 Esc 와 닫기 버튼으로 닫는다 */}
      <dialog
        ref={dialogRef}
        aria-labelledby="paori-easter-egg-title"
        onClick={closeOnBackdropClick}
        className="m-auto max-h-[85dvh] w-[min(100%-2rem,30rem)] overflow-y-auto rounded-sm border border-border bg-surface p-0 text-body-sm break-keep text-foreground normal-case backdrop:bg-foreground/40"
      >
        <div className="flex flex-col gap-element p-card">
          <div className="flex items-center gap-2">
            <Image
              src={siteLogo}
              alt=""
              width={28}
              height={28}
              className="[image-rendering:pixelated]"
            />
            <h2 id="paori-easter-egg-title" className="text-body">
              꽥! 파오리를 찾았어요.
            </h2>
          </div>

          {/* whitespace-pre-line: 편지 문자열 안의 \n 을 줄바꿈으로 보여준다 */}
          <div className="flex flex-col gap-3 leading-relaxed whitespace-pre-line">
            {LETTER_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="text-muted-foreground">{LETTER_POSTSCRIPT}</p>
          </div>
          <form method="dialog" className="flex justify-end">
            <button
              type="submit"
              className="rounded-sm border border-border px-[7px] py-1 text-caption tracking-caption uppercase hover:bg-background"
            >
              닫기
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}

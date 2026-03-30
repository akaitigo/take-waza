import { useCallback, useEffect, useMemo, useState } from "react";
import { decomposeSteps } from "../lib/step-decompose";
import type { StepSequence } from "../lib/step-decompose";
import type { WeavingGraph } from "../lib/wasm-bridge";

export interface StepNavigationState {
	readonly sequence: StepSequence;
	readonly currentStep: number;
	readonly isFirst: boolean;
	readonly isLast: boolean;
	readonly completedEdgeIds: ReadonlySet<number>;
	readonly currentEdgeId: number | undefined;
	readonly currentDescription: string;
	readonly goNext: () => void;
	readonly goPrev: () => void;
	readonly goToStep: (step: number) => void;
	readonly reset: () => void;
}

/** ステップナビゲーション管理フック */
export function useStepNavigation(graph: WeavingGraph): StepNavigationState {
	const sequence = useMemo(() => decomposeSteps(graph), [graph]);
	const [currentStep, setCurrentStep] = useState(0);

	// グラフ変更時にステップをリセット
	// biome-ignore lint/correctness/useExhaustiveDependencies: graph参照変更でリセットする意図的な設計
	useEffect(() => {
		setCurrentStep(0);
	}, [graph]);

	const isFirst = currentStep <= 0;
	const isLast = currentStep >= sequence.totalSteps - 1;

	const goNext = useCallback(() => {
		setCurrentStep((prev) => Math.min(prev + 1, sequence.totalSteps - 1));
	}, [sequence.totalSteps]);

	const goPrev = useCallback(() => {
		setCurrentStep((prev) => Math.max(prev - 1, 0));
	}, []);

	const goToStep = useCallback(
		(step: number) => {
			const clamped = Math.max(0, Math.min(step, sequence.totalSteps - 1));
			setCurrentStep(clamped);
		},
		[sequence.totalSteps],
	);

	const reset = useCallback(() => {
		setCurrentStep(0);
	}, []);

	// 完了済みエッジIDセット
	const completedEdgeIds = useMemo(() => {
		const ids = new Set<number>();
		for (let i = 0; i < currentStep; i++) {
			const step = sequence.steps[i];
			if (step) {
				ids.add(step.edgeId);
			}
		}
		return ids;
	}, [sequence, currentStep]);

	const currentEdgeId = sequence.steps[currentStep]?.edgeId;
	const currentDescription = sequence.steps[currentStep]?.description ?? "";

	// キーボードショートカット
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "ArrowRight") {
				e.preventDefault();
				setCurrentStep((prev) => Math.min(prev + 1, sequence.totalSteps - 1));
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				setCurrentStep((prev) => Math.max(prev - 1, 0));
			}
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [sequence.totalSteps]);

	return {
		sequence,
		currentStep,
		isFirst,
		isLast,
		completedEdgeIds,
		currentEdgeId,
		currentDescription,
		goNext,
		goPrev,
		goToStep,
		reset,
	};
}

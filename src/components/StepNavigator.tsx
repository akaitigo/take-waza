/**
 * StepNavigator: ステップバイステップ図解のナビゲーションUI
 *
 * 前へ/次へボタン、プログレスバー、ステップ説明テキストを表示する。
 */

import type { StepNavigationState } from "../hooks/useStepNavigation";

interface StepNavigatorProps {
	readonly navigation: StepNavigationState;
}

const containerStyle: React.CSSProperties = {
	padding: "12px 16px",
	backgroundColor: "#16213e",
	color: "#e0e0e0",
	fontFamily: "sans-serif",
	fontSize: "0.85rem",
	display: "flex",
	flexDirection: "column",
	gap: "8px",
	borderTop: "1px solid #333",
};

const controlsStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: "8px",
};

const buttonStyle: React.CSSProperties = {
	padding: "6px 16px",
	backgroundColor: "#D4A76A",
	color: "#1a1a2e",
	border: "none",
	borderRadius: "4px",
	cursor: "pointer",
	fontWeight: "bold",
	fontSize: "0.85rem",
};

const disabledButtonStyle: React.CSSProperties = {
	...buttonStyle,
	opacity: 0.4,
	cursor: "not-allowed",
};

const progressBarContainerStyle: React.CSSProperties = {
	width: "100%",
	height: "6px",
	backgroundColor: "#333",
	borderRadius: "3px",
	overflow: "hidden",
};

export function StepNavigator({ navigation }: StepNavigatorProps) {
	const { sequence, currentStep, isFirst, isLast, goNext, goPrev, currentDescription } = navigation;

	if (sequence.totalSteps === 0) {
		return null;
	}

	const progressPercent = ((currentStep + 1) / sequence.totalSteps) * 100;

	return (
		<nav style={containerStyle} aria-label="編み手順ナビゲーション">
			{/* プログレスバー */}
			<div
				style={progressBarContainerStyle}
				role="progressbar"
				tabIndex={0}
				aria-valuenow={currentStep + 1}
				aria-valuemin={1}
				aria-valuemax={sequence.totalSteps}
			>
				<div
					style={{
						width: `${String(progressPercent)}%`,
						height: "100%",
						backgroundColor: "#D4A76A",
						transition: "width 0.2s ease",
					}}
				/>
			</div>

			{/* コントロール */}
			<div style={controlsStyle}>
				<button
					type="button"
					onClick={goPrev}
					disabled={isFirst}
					style={isFirst ? disabledButtonStyle : buttonStyle}
					aria-label="前のステップ"
				>
					← 前へ
				</button>

				<span
					style={{
						flex: 1,
						textAlign: "center",
						fontVariantNumeric: "tabular-nums",
					}}
				>
					{currentStep + 1} / {sequence.totalSteps}
				</span>

				<button
					type="button"
					onClick={goNext}
					disabled={isLast}
					style={isLast ? disabledButtonStyle : buttonStyle}
					aria-label="次のステップ"
				>
					次へ →
				</button>
			</div>

			{/* ステップ説明 */}
			<p
				style={{
					margin: 0,
					fontSize: "0.8rem",
					opacity: 0.8,
					minHeight: "1.2em",
				}}
			>
				{currentDescription}
			</p>

			{/* キーボードヒント */}
			<p style={{ margin: 0, fontSize: "0.7rem", opacity: 0.4 }}>← → キーでステップ移動</p>
		</nav>
	);
}

/**
 * ParameterPanel: 竹ひごパラメータのインタラクティブ調整パネル
 *
 * パターン選択、幅・厚さスライダー、本数入力を提供する。
 */

import { useCallback, useState } from "react";
import type { PatternParams } from "../hooks/usePatternParams";
import { isValidPatternName, MAX_COUNT, PATTERN_NAMES, type PatternName } from "../lib/wasm-bridge";

/** パターン名の日本語ラベル */
const PATTERN_LABELS: Record<PatternName, string> = {
	mutsume: "六つ目編み",
	ajiro: "網代編み",
	gozame: "ござ目編み",
};

interface ParameterPanelProps {
	readonly params: PatternParams;
	readonly onPatternChange: (pattern: PatternName) => void;
	readonly onWidthChange: (width: number) => void;
	readonly onThicknessChange: (thickness: number) => void;
	readonly onCountChange: (count: number) => void;
}

const panelStyle: React.CSSProperties = {
	padding: "16px",
	backgroundColor: "#16213e",
	color: "#e0e0e0",
	fontFamily: "sans-serif",
	fontSize: "0.9rem",
	display: "flex",
	flexDirection: "column",
	gap: "16px",
	minWidth: "240px",
	maxWidth: "320px",
	overflowY: "auto",
};

const labelStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "4px",
};

const sliderContainerStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: "8px",
};

const inputStyle: React.CSSProperties = {
	width: "100%",
	accentColor: "#D4A76A",
};

const valueStyle: React.CSSProperties = {
	minWidth: "50px",
	textAlign: "right",
	fontVariantNumeric: "tabular-nums",
};

const selectStyle: React.CSSProperties = {
	width: "100%",
	padding: "6px 8px",
	backgroundColor: "#1a1a2e",
	color: "#e0e0e0",
	border: "1px solid #444",
	borderRadius: "4px",
	fontSize: "0.9rem",
};

const numberInputStyle: React.CSSProperties = {
	width: "80px",
	padding: "6px 8px",
	backgroundColor: "#1a1a2e",
	color: "#e0e0e0",
	border: "1px solid #444",
	borderRadius: "4px",
	fontSize: "0.9rem",
	textAlign: "center",
};

export function ParameterPanel({
	params,
	onPatternChange,
	onWidthChange,
	onThicknessChange,
	onCountChange,
}: ParameterPanelProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	const handlePatternChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const value = e.target.value;
			if (isValidPatternName(value)) {
				onPatternChange(value);
			}
		},
		[onPatternChange],
	);

	const handleWidthChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onWidthChange(Number.parseFloat(e.target.value));
		},
		[onWidthChange],
	);

	const handleThicknessChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onThicknessChange(Number.parseFloat(e.target.value));
		},
		[onThicknessChange],
	);

	const handleCountChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number.parseInt(e.target.value, 10);
			if (Number.isFinite(value)) {
				onCountChange(value);
			}
		},
		[onCountChange],
	);

	const toggleCollapse = useCallback(() => {
		setIsCollapsed((prev) => !prev);
	}, []);

	return (
		<aside aria-label="パラメータ設定">
			<button
				type="button"
				onClick={toggleCollapse}
				style={{
					display: "none",
					width: "100%",
					padding: "8px",
					backgroundColor: "#16213e",
					color: "#e0e0e0",
					border: "none",
					cursor: "pointer",
					fontSize: "0.9rem",
				}}
				className="panel-toggle"
			>
				{isCollapsed ? "パラメータを開く" : "パラメータを閉じる"}
			</button>

			{!isCollapsed && (
				<div style={panelStyle}>
					<h2
						style={{
							margin: 0,
							fontSize: "1rem",
							borderBottom: "1px solid #444",
							paddingBottom: "8px",
						}}
					>
						パラメータ設定
					</h2>

					{/* パターン選択 */}
					<label style={labelStyle}>
						パターン
						<select
							value={params.pattern}
							onChange={handlePatternChange}
							style={selectStyle}
							aria-label="編みパターンの選択"
						>
							{PATTERN_NAMES.map((name) => (
								<option key={name} value={name}>
									{PATTERN_LABELS[name]}
								</option>
							))}
						</select>
					</label>

					{/* 幅スライダー */}
					<label style={labelStyle}>
						竹ひご幅
						<div style={sliderContainerStyle}>
							<input
								type="range"
								min="1"
								max="20"
								step="0.5"
								value={params.width}
								onChange={handleWidthChange}
								style={inputStyle}
								aria-label="竹ひご幅の調整（1-20mm）"
								aria-valuemin={1}
								aria-valuemax={20}
								aria-valuenow={params.width}
							/>
							<span style={valueStyle}>{params.width}mm</span>
						</div>
					</label>

					{/* 厚さスライダー */}
					<label style={labelStyle}>
						竹ひご厚さ
						<div style={sliderContainerStyle}>
							<input
								type="range"
								min="0.5"
								max="5"
								step="0.1"
								value={params.thickness}
								onChange={handleThicknessChange}
								style={inputStyle}
								aria-label="竹ひご厚さの調整（0.5-5mm）"
								aria-valuemin={0.5}
								aria-valuemax={5}
								aria-valuenow={params.thickness}
							/>
							<span style={valueStyle}>{params.thickness}mm</span>
						</div>
					</label>

					{/* 本数入力 */}
					<label style={labelStyle}>
						本数
						<div style={sliderContainerStyle}>
							<input
								type="number"
								min="1"
								max={MAX_COUNT}
								step="1"
								value={params.count}
								onChange={handleCountChange}
								style={numberInputStyle}
								aria-label={`竹ひごの本数（1-${String(MAX_COUNT)}）`}
							/>
							<span style={{ fontSize: "0.85rem", opacity: 0.7 }}>本 (1-{MAX_COUNT})</span>
						</div>
						{params.count >= MAX_COUNT && (
							<span
								style={{
									fontSize: "0.75rem",
									color: "#eab308",
									marginTop: "4px",
								}}
							>
								描画パフォーマンスのため上限 {MAX_COUNT} 本に制限されています
							</span>
						)}
					</label>

					{/* 情報表示 */}
					<div
						style={{
							fontSize: "0.8rem",
							opacity: 0.5,
							borderTop: "1px solid #333",
							paddingTop: "8px",
						}}
					>
						<p style={{ margin: "2px 0" }}>ノード数: {params.count * params.count}</p>
						<p style={{ margin: "2px 0" }}>パターン: {PATTERN_LABELS[params.pattern]}</p>
					</div>
				</div>
			)}
		</aside>
	);
}

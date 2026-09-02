# 📈 金利と株価の数理メカニズム (Rate & Equity Dynamics)

> **中央銀行の利上げがなぜ株価を下落させるのか？**  
> 割引キャッシュフローモデル（DCF）、ゴードン成長モデル、株式デュレーション、Fedモデル（イールドスプレッド）の数式を用いて厳密に証明し、直感的なインタラクティブ・シミュレーションで可視化・解説するWebアプリケーションです。

---

## 🤖 About this Project & Antigravity

本プロジェクトおよびWebサイトは、**Google DeepMind の次世代AIコーディングエージェント「[Antigravity](https://deepmind.google/)」**とのペアプログラミングによって設計・実装・検証・GitHub Pagesへの公開まで一貫して作成されました。

- **目的**: ファイナンス理論・金融経済学における「金利上昇と株価下落の相関メカニズム」を、数学的証明（微積分・無限級数）とグラフィカルな対話型シミュレーションを通じて誰でも直感的に学べるオープンソース教材を提供すること。
- **技術スタック**: HTML5, CSS3 (モダンファイナンシャルUI / ダーク・ライトモード), ES6 JavaScript, Chart.js 4.4, KaTeX (LaTeX数式レンダリング), Lucide Icons, GitHub Pages.

---

## 🌐 GitHub Pages 公開URL
本Webアプリケーションは GitHub Pages にて公開されています。
- **公開ページ URL**: [https://katzkawai.org/kklab-rate-equity-dynamics/](https://katzkawai.org/kklab-rate-equity-dynamics/)  
  *(GitHubドメイン: [https://katzkawai.github.io/kklab-rate-equity-dynamics/](https://katzkawai.github.io/kklab-rate-equity-dynamics/))*

---

## 🎯 概要と3つの波及経路

「金利が上がると株価が下がる」という市場の鉄則は、単なる経験則や心理現象ではなく、**厳密な数理的根拠（ファイナンス理論）**に基づいています。本プロジェクトでは、以下の3つの経路からそのメカニズムを解明します。

```
┌─────────────────────────────────────────────────────────────┐
│                   政策金利の引き上げ (Δrf > 0)               │
└──────────────┬──────────────────┬──────────────────┬────────┘
               │                  │                  │
               ▼                  ▼                  ▼
      【① 割引率の上昇】    【② 企業業績の圧迫】   【③ 債券への資金シフト】
         (分母の拡大)           (分子の縮小)         (PERの圧縮)
               │                  │                  │
         将来CF現在価値↓     純利益↓ / 成長率g↓   国債利回り上昇
               │                  │               相対魅力低下
               └──────────────────┼──────────────────┘
                                  ▼
                        【理論株価の下落 (P ↓)】
```

1. **分母効果（割引率の上昇）**: 無リスク金利 $r_f$ の上昇により株主資本コスト $r$ が上昇し、遠い未来のキャッシュフローの現在価値が指数関数的に激減する。
2. **分子効果（業績・成長率の抑制）**: 借入金利（負債コスト）の上昇で支払利息が増加（EPS低下）し、新規設備投資の採算ハードル（WACC）が上がって将来の利益成長率 $g$ が低下する。
3. **裁定・代替効果（Fedモデル）**: 安全資産である国債の利回り上昇に伴い、株式の要求益利回りが上昇し、株価収益率（PER）のバリュエーション圧縮（Multiple Compression）が発生する。

---

## 📐 数理的証明 (Mathematical Proofs)

### 1. ゴードン成長モデルにおける株価の単調減少性
予想1株あたり配当を $D_1$、割引率を $r$、永続成長率を $g$ （$r > g$）とすると、理論株価 $P$ は以下のように定義されます：

$$P = \sum_{t=1}^{\infty} \frac{D_0 (1+g)^t}{(1+r)^t} = \frac{D_1}{r - g}$$

資本資産評価モデル（CAPM）より、$r = r_f + \beta \cdot ERP$ であり、$\frac{\partial r}{\partial r_f} = 1 > 0$ です。

#### 1階微分（下落の証明）:
$$\frac{\partial P}{\partial r} = -\frac{D_1}{(r - g)^2} < 0$$

配当 $D_1 > 0$ かつ $(r - g)^2 > 0$ であるため、金利 $r$ に対する株価 $P$ の偏微分は常に**厳密に負**となります。  
**ゆえに、金利が上昇すると株価は必ず下落します。**

#### 2階微分（凸性・Convexity）:
$$\frac{\partial^2 P}{\partial r^2} = \frac{2 D_1}{(r - g)^3} > 0$$

関数 $P(r)$ は下に凸（Convex）であり、**「ゼロ金利から少し金利が上がる時」の下落ショックが最も大きく**、金利水準が高くなるほど1%利上げあたりの下落額は緩やかになります。

---

### 2. 株式デュレーションと「グロース株ショック」の数理
株価の金利弾力性（修正デュレーション）は以下で表されます：

$$D_{\text{equity}} = -\frac{1}{P}\frac{\partial P}{\partial r} = \frac{1}{r - g}$$

- **バリュー株**（成熟企業: $g=1.5\%$, $r=8.0\%$）: $D_{\text{val}} \approx \frac{1}{0.065} \approx 15.4\text{年}$
- **グロース株**（高成長企業: $g=6.0\%$, $r=8.0\%$）: $D_{\text{growth}} \approx \frac{1}{0.020} \approx 50.0\text{年}$

金利が $+2\%$ 上昇した時の株価下落率は $\Delta P / P \approx -D \cdot \Delta r$ に比例するため、**グロース株はバリュー株の2倍〜3倍以上激しく下落**します。

---

### 3. Fedモデルとマルチプル・コンプレッション (PER圧縮)
株式益利回りと国債利回り・PERの関係：

$$\text{Earnings Yield } \frac{E}{P} = r_f + ERP - g \iff \text{Fair PER} = \frac{1}{r_f + ERP - g}$$

利益（EPS）が一切不変であっても、金利 $r_f$ が $0.5\% \to 5.0\%$ に上がると、適正PERは $28.6\text{倍} \to 12.5\text{倍}$ （約 $-56\%$）へと圧縮されます。

---

## 🛠 Webアプリケーションの主な機能

- 📊 **インタラクティブ・ゴードン曲線 & 接線ビジュアライザー**:
  - スライダー操作（金利 $r_f$, リスクプレミアム $ERP$, 成長率 $g$, 配当 $D_1$）でリアルタイムに曲線と微分接線を描画。
- ⏳ **20年間キャッシュフロー現在価値の年別バーチャート**:
  - 複利割引効果 $(1+r)^t$ により、遠い未来のCFほど消滅していく様子を視覚化。
- ⚡ **バリュー株 vs グロース株 デュレーション比較シミュレーター**:
  - 利上げ幅に応じた両者の価格下落率カーブを直接比較。
- 📉 **PERマルチプル収縮曲線**:
  - 金利と許容バリュエーション倍率の反比例関係をグラフ化。
- 🎛 **総合ファイナンス・ラボ & 感応度ヒートマップ**:
  - 6つのパラメータを自在に組み合わせ、利上げショックの総影響額と、金利×成長率マトリックスを即座に再計算。
- 🏛 **歴史的シナリオプリセット**:
  - 「2022年 FRB急激利上げ」「ゼロ金利バブル」「スタグフレーション」等を1クリックで再現。
- 🌓 **ダークモード / ライトモード対応 & レスポンシブ設計**:
  - Bloomberg / TradingView スタイルのモダンなUI。KaTeXによる数式レンダリング。

---

## 📚 参考文献・理論的背景
- Gordon, M. J. (1959). *Dividends, Dilution, and the Cost of Capital*. The Journal of Finance.
- Sharpe, W. F. (1964). *Capital Asset Prices: A Theory of Market Equilibrium*. The Journal of Finance.
- Campbell, J. Y., & Shiller, R. J. (1988). *The Dividend-Price Ratio and Expectations of Future Dividends and Discount Factors*. The Review of Financial Studies.
- Asness, C. S. (2003). *Fight the FED Model: The Relationship Between Stock Market Yields, Bond Yields, and Expected Returns*. The Journal of Portfolio Management.

---
Created with ❤️ using **Antigravity** (Google DeepMind) for Quantitative Finance & Economics Education.

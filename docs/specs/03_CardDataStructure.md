# 4. Cardデータ構造

CardデータはCellの一種で、複数のCellをまとめる役割を持つ特別なCell。

## 4.1 Core Properties

| プロパティ名 | 値 / 形式 | 説明 |
| --- | --- | --- |
| `attribute` | "Card" | 固定値。|
| `name` | string |指定がない限り"Card"を指定。|
| `value` | string | 子CellのIDリストをスペース区切りで格納|

他のプロパティはCellのデータ構造に準拠する。

## 4.2 関連ロジック

### 包含関係
- Cardの `value` にIDが含まれているCellは、そのCardの子要素として扱われます。
- 1つのCellが複数のCardに含まれることもシステムのデータ構造上は可能ですが、UIの挙動は実装に依存します。

### 削除（除外）
- `remove` プロパティにタイムスタンプ文字列が設定されている場合、そのCardは論理削除（ゴミ箱入り）状態となります。
- Cardが`remove`判定の場合、その子Cellも全て`remove`判定となる。

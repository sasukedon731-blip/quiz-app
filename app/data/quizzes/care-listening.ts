import type { Quiz } from "@/app/data/types"

export const careListeningQuiz: Quiz = {
  id: "care-listening",
  title: "介護リスニング（重要100）",
  questions: [
    // ===== 身体介助・基本動作 =====
    { id: 1, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ADL", choices: [
      "急に混乱し意識が変化 / delirium",
      "日常生活の動作 / activities of daily living",
      "関節が動きにくくなる / contracture",
      "日帰りで通うサービス / day service"
    ], correctIndex: 1, explanation: "【音声】ADL\n\n「ADL」は「日常生活の動作」という意味です。" },
    { id: 2, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "QOL", choices: [
      "一部だけ介助が必要 / partial assistance",
      "介護を行う職員 / care worker",
      "歩行を助けるつえ / cane",
      "生活の質 / quality of life"
    ], correctIndex: 3, explanation: "【音声】QOL\n\n「QOL」は「生活の質」という意味です。" },
    { id: 3, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "移乗", choices: [
      "生活動作訓練の専門職 / occupational therapist",
      "ベッド⇄車椅子などへ移る / transfer",
      "よく聴いて受け止める / active listening",
      "姿勢を変える / repositioning"
    ], correctIndex: 1, explanation: "【音声】移乗\n\n「移乗」は「ベッド⇄車椅子などへ移る」という意味です。" },
    { id: 4, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "移動", choices: [
      "目的なく歩き回る / wandering",
      "入浴を手伝う / bathing assistance",
      "場所を移る / move",
      "体温・血圧など生命徴候 / vital signs"
    ], correctIndex: 2, explanation: "【音声】移動\n\n「移動」は「場所を移る」という意味です。" },
    { id: 5, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "更衣", choices: [
      "服を着替える / change clothes",
      "関節が動きにくくなる / contracture",
      "床ずれ / pressure ulcer",
      "薬を間違える / medication error"
    ], correctIndex: 0, explanation: "【音声】更衣\n\n「更衣」は「服を着替える」という意味です。" },
    { id: 6, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "整容", choices: [
      "自分で食べやすくする道具 / adaptive utensil",
      "高さ調整できるベッド / care bed",
      "姿勢を変える / repositioning",
      "身だしなみを整える / grooming"
    ], correctIndex: 3, explanation: "【音声】整容\n\n「整容」は「身だしなみを整える」という意味です。" },
    { id: 7, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "口腔ケア", choices: [
      "体が動きにくい状態 / paralysis",
      "特別養護老人ホーム / special nursing home",
      "飲み込みやすくする粘り / thickener",
      "口の中を清潔にする / oral care"
    ], correctIndex: 3, explanation: "【音声】口腔ケア\n\n「口腔ケア」は「口の中を清潔にする」という意味です。" },
    { id: 8, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "入浴介助", choices: [
      "やわらかい食事 / soft diet",
      "場所を移る / move",
      "入浴を手伝う / bathing assistance",
      "暴力・放置など不適切な扱い / abuse"
    ], correctIndex: 2, explanation: "【音声】入浴介助\n\n「入浴介助」は「入浴を手伝う」という意味です。" },
    { id: 9, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "清拭", choices: [
      "ミキサーでペースト状 / pureed diet",
      "高さ調整できるベッド / care bed",
      "一部だけ介助が必要 / partial assistance",
      "体を拭いて清潔にする / bed bath"
    ], correctIndex: 3, explanation: "【音声】清拭\n\n「清拭」は「体を拭いて清潔にする」という意味です。" },
    { id: 10, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "排泄介助", choices: [
      "歩行を助けるつえ / cane",
      "自分で食べやすくする道具 / adaptive utensil",
      "トイレや排泄を手伝う / toileting assistance",
      "急に状態が悪化 / sudden change"
    ], correctIndex: 2, explanation: "【音声】排泄介助\n\n「排泄介助」は「トイレや排泄を手伝う」という意味です。" },
    { id: 11, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "おむつ交換", choices: [
      "立っている姿勢 / standing position",
      "意識の状態 / level of consciousness",
      "かむこと / chewing",
      "おむつを替える / diaper change"
    ], correctIndex: 3, explanation: "【音声】おむつ交換\n\n「おむつ交換」は「おむつを替える」という意味です。" },
    { id: 12, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "体位変換", choices: [
      "落ち着かず興奮している / agitation",
      "食器を下げる / clearing dishes",
      "水分不足 / dehydration",
      "姿勢を変える / repositioning"
    ], correctIndex: 3, explanation: "【音声】体位変換\n\n「体位変換」は「姿勢を変える」という意味です。" },
    { id: 13, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "離床", choices: [
      "立っている姿勢 / standing position",
      "ベッドから起き上がる / getting out of bed",
      "救急車で病院へ運ぶ / emergency transport",
      "急に状態が悪化 / sudden change"
    ], correctIndex: 1, explanation: "【音声】離床\n\n「離床」は「ベッドから起き上がる」という意味です。" },
    { id: 14, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "端座位", choices: [
      "ベッド端で座る姿勢 / sitting at bed edge",
      "バイタルを記録する表 / vital chart",
      "身だしなみを整える / grooming",
      "体が動きにくい状態 / paralysis"
    ], correctIndex: 0, explanation: "【音声】端座位\n\n「端座位」は「ベッド端で座る姿勢」という意味です。" },
    { id: 15, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "立位", choices: [
      "生活動作訓練の専門職 / occupational therapist",
      "体を拭いて清潔にする / bed bath",
      "立っている姿勢 / standing position",
      "持ち上げ移動する機器 / lift"
    ], correctIndex: 2, explanation: "【音声】立位\n\n「立位」は「立っている姿勢」という意味です。" },
    { id: 16, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "臥位", choices: [
      "横になっている姿勢 / lying position",
      "呼び出しボタン / nurse call",
      "相手をそのまま受け入れる / acceptance",
      "ベッド端で座る姿勢 / sitting at bed edge"
    ], correctIndex: 0, explanation: "【音声】臥位\n\n「臥位」は「横になっている姿勢」という意味です。" },
    { id: 17, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "全介助", choices: [
      "すべて介助が必要 / total assistance",
      "相手をそのまま受け入れる / acceptance",
      "飲み込むこと / swallowing",
      "息ができない / choking"
    ], correctIndex: 0, explanation: "【音声】全介助\n\n「全介助」は「すべて介助が必要」という意味です。" },
    { id: 18, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "一部介助", choices: [
      "一部だけ介助が必要 / partial assistance",
      "支援内容を記録する / case notes",
      "ケアプランを作る専門職 / care manager",
      "つかまる棒 / handrail"
    ], correctIndex: 0, explanation: "【音声】一部介助\n\n「一部介助」は「一部だけ介助が必要」という意味です。" },
    { id: 19, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "見守り", choices: [
      "姿勢を変える / repositioning",
      "安全のためそばで様子を見る / supervision",
      "床ずれ / pressure ulcer",
      "やわらかい食事 / soft diet"
    ], correctIndex: 1, explanation: "【音声】見守り\n\n「見守り」は「安全のためそばで様子を見る」という意味です。" },
    { id: 20, sectionId: "adl", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "自立", choices: [
      "歩行を助けるつえ / cane",
      "自分でできる / independent",
      "暴力・放置など不適切な扱い / abuse",
      "バイタルを記録する表 / vital chart"
    ], correctIndex: 1, explanation: "【音声】自立\n\n「自立」は「自分でできる」という意味です。" },
    // ===== 食事・水分 =====
    { id: 21, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "嚥下", choices: [
      "床ずれ / pressure ulcer",
      "部屋で使える便器 / portable toilet",
      "飲み込むこと / swallowing",
      "食事を手伝う / feeding assistance"
    ], correctIndex: 2, explanation: "【音声】嚥下\n\n「嚥下」は「飲み込むこと」という意味です。" },
    { id: 22, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "咀嚼", choices: [
      "体温・血圧など生命徴候 / vital signs",
      "かむこと / chewing",
      "体の温度 / body temperature",
      "関節が動きにくくなる / contracture"
    ], correctIndex: 1, explanation: "【音声】咀嚼\n\n「咀嚼」は「かむこと」という意味です。" },
    { id: 23, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "誤嚥", choices: [
      "食べ物が気管に入る / aspiration",
      "おむつを替える / diaper change",
      "食事を配る / serving meals",
      "生活動作を助ける道具 / assistive device"
    ], correctIndex: 0, explanation: "【音声】誤嚥\n\n「誤嚥」は「食べ物が気管に入る」という意味です。" },
    { id: 24, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "誤飲", choices: [
      "飲み込んではいけない物を飲み込む / accidental ingestion",
      "薬を間違える / medication error",
      "情報を次の担当へ伝える / handover",
      "呼び出しボタン / nurse call"
    ], correctIndex: 0, explanation: "【音声】誤飲\n\n「誤飲」は「飲み込んではいけない物を飲み込む」という意味です。" },
    { id: 25, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "食事介助", choices: [
      "生活動作訓練の専門職 / occupational therapist",
      "水分不足 / dehydration",
      "食事を手伝う / feeding assistance",
      "呼び出しボタン / nurse call"
    ], correctIndex: 2, explanation: "【音声】食事介助\n\n「食事介助」は「食事を手伝う」という意味です。" },
    { id: 26, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "配膳", choices: [
      "食事を配る / serving meals",
      "飲み込みやすくする粘り / thickener",
      "家に帰りたいと思い続ける / desire to go home",
      "息をすること / breathing"
    ], correctIndex: 0, explanation: "【音声】配膳\n\n「配膳」は「食事を配る」という意味です。" },
    { id: 27, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "下膳", choices: [
      "食器を下げる / clearing dishes",
      "尿を吸収するパッド / incontinence pad",
      "高さ調整できるベッド / care bed",
      "ヒヤリとした出来事の報告 / near-miss report"
    ], correctIndex: 0, explanation: "【音声】下膳\n\n「下膳」は「食器を下げる」という意味です。" },
    { id: 28, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "残食", choices: [
      "食べ残し / leftover food",
      "歩くのを助ける器具 / walker",
      "恥ずかしい気持ち / sense of shame",
      "急に状態が悪化 / sudden change"
    ], correctIndex: 0, explanation: "【音声】残食\n\n「残食」は「食べ残し」という意味です。" },
    { id: 29, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "水分摂取", choices: [
      "横になっている姿勢 / lying position",
      "水分を取る / hydration",
      "暑さで体調不良 / heatstroke",
      "細かく刻んだ食事 / chopped diet"
    ], correctIndex: 1, explanation: "【音声】水分摂取\n\n「水分摂取」は「水分を取る」という意味です。" },
    { id: 30, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "とろみ", choices: [
      "薬を間違える / medication error",
      "支援内容を記録する / case notes",
      "飲み込みやすくする粘り / thickener",
      "体の動きを制限する / physical restraint"
    ], correctIndex: 2, explanation: "【音声】とろみ\n\n「とろみ」は「飲み込みやすくする粘り」という意味です。" },
    { id: 31, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "刻み食", choices: [
      "感染予防で分ける / isolation",
      "体の温度 / body temperature",
      "細かく刻んだ食事 / chopped diet",
      "つかまる棒 / handrail"
    ], correctIndex: 2, explanation: "【音声】刻み食\n\n「刻み食」は「細かく刻んだ食事」という意味です。" },
    { id: 32, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ミキサー食", choices: [
      "飲み込みやすくする粘り / thickener",
      "ミキサーでペースト状 / pureed diet",
      "記憶や判断が低下する病気 / dementia",
      "息をすること / breathing"
    ], correctIndex: 1, explanation: "【音声】ミキサー食\n\n「ミキサー食」は「ミキサーでペースト状」という意味です。" },
    { id: 33, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ソフト食", choices: [
      "息ができない / choking",
      "すべて介助が必要 / total assistance",
      "やわらかい食事 / soft diet",
      "支援内容を記録する / case notes"
    ], correctIndex: 2, explanation: "【音声】ソフト食\n\n「ソフト食」は「やわらかい食事」という意味です。" },
    { id: 34, sectionId: "meal", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "自助具", choices: [
      "自分で食べやすくする道具 / adaptive utensil",
      "急に状態が悪化 / sudden change",
      "息をすること / breathing",
      "ヒヤリとした出来事の報告 / near-miss report"
    ], correctIndex: 0, explanation: "【音声】自助具\n\n「自助具」は「自分で食べやすくする道具」という意味です。" },
    // ===== 健康状態・バイタル =====
    { id: 35, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "バイタルサイン", choices: [
      "体温・血圧など生命徴候 / vital signs",
      "状態の変化を継続確認 / monitoring",
      "ベッド端で座る姿勢 / sitting at bed edge",
      "生活の質 / quality of life"
    ], correctIndex: 0, explanation: "【音声】バイタルサイン\n\n「バイタルサイン」は「体温・血圧など生命徴候」という意味です。" },
    { id: 36, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "血圧", choices: [
      "飲み込んではいけない物を飲み込む / accidental ingestion",
      "関節が動きにくくなる / contracture",
      "気持ちに寄り添う / empathy",
      "血の圧力 / blood pressure"
    ], correctIndex: 3, explanation: "【音声】血圧\n\n「血圧」は「血の圧力」という意味です。" },
    { id: 37, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "体温", choices: [
      "立っている姿勢 / standing position",
      "体を拭いて清潔にする / bed bath",
      "体の温度 / body temperature",
      "家に帰りたいと思い続ける / desire to go home"
    ], correctIndex: 2, explanation: "【音声】体温\n\n「体温」は「体の温度」という意味です。" },
    { id: 38, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "脈拍", choices: [
      "自分でできる / independent",
      "バイタルを記録する表 / vital chart",
      "血中酸素飽和度 / oxygen saturation",
      "脈の回数 / pulse rate"
    ], correctIndex: 3, explanation: "【音声】脈拍\n\n「脈拍」は「脈の回数」という意味です。" },
    { id: 39, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "呼吸", choices: [
      "息をすること / breathing",
      "物を盗まれたと思い込む / delusion of theft",
      "薬を間違える / medication error",
      "情報を次の担当へ伝える / handover"
    ], correctIndex: 0, explanation: "【音声】呼吸\n\n「呼吸」は「息をすること」という意味です。" },
    { id: 40, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "SpO2", choices: [
      "気持ちに寄り添う / empathy",
      "血中酸素飽和度 / oxygen saturation",
      "座って移動するいす / wheelchair",
      "息をすること / breathing"
    ], correctIndex: 1, explanation: "【音声】SpO2\n\n「SpO2」は「血中酸素飽和度」という意味です。" },
    { id: 41, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "意識レベル", choices: [
      "ベッドから起き上がる / getting out of bed",
      "意識の状態 / level of consciousness",
      "感染予防で分ける / isolation",
      "ケアプランを作る専門職 / care manager"
    ], correctIndex: 1, explanation: "【音声】意識レベル\n\n「意識レベル」は「意識の状態」という意味です。" },
    { id: 42, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "発赤", choices: [
      "おむつを替える / diaper change",
      "介護老人保健施設 / health services facility",
      "皮膚が赤くなる / redness",
      "自分で食べやすくする道具 / adaptive utensil"
    ], correctIndex: 2, explanation: "【音声】発赤\n\n「発赤」は「皮膚が赤くなる」という意味です。" },
    { id: 43, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "褥瘡", choices: [
      "飲み込むこと / swallowing",
      "トイレや排泄を手伝う / toileting assistance",
      "ヒヤリとした出来事の報告 / near-miss report",
      "床ずれ / pressure ulcer"
    ], correctIndex: 3, explanation: "【音声】褥瘡\n\n「褥瘡」は「床ずれ」という意味です。" },
    { id: 44, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "浮腫", choices: [
      "高い所から落ちる / fall from height",
      "高さ調整できるベッド / care bed",
      "むくみ / edema",
      "サービスを利用する人 / service user"
    ], correctIndex: 2, explanation: "【音声】浮腫\n\n「浮腫」は「むくみ」という意味です。" },
    { id: 45, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "拘縮", choices: [
      "体の温度 / body temperature",
      "息ができない / choking",
      "関節が動きにくくなる / contracture",
      "急に状態が悪化 / sudden change"
    ], correctIndex: 2, explanation: "【音声】拘縮\n\n「拘縮」は「関節が動きにくくなる」という意味です。" },
    { id: 46, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "麻痺", choices: [
      "看護を行う専門職 / nurse",
      "体が動きにくい状態 / paralysis",
      "説明に同意した書面 / consent form",
      "自分で食べやすくする道具 / adaptive utensil"
    ], correctIndex: 1, explanation: "【音声】麻痺\n\n「麻痺」は「体が動きにくい状態」という意味です。" },
    { id: 47, sectionId: "vital", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "羞恥心", choices: [
      "水分を取る / hydration",
      "恥ずかしい気持ち / sense of shame",
      "生活動作訓練の専門職 / occupational therapist",
      "介護の計画 / care plan"
    ], correctIndex: 1, explanation: "【音声】羞恥心\n\n「羞恥心」は「恥ずかしい気持ち」という意味です。" },
    // ===== 認知症・メンタル =====
    { id: 48, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "認知症", choices: [
      "記憶や判断が低下する病気 / dementia",
      "トイレや排泄を手伝う / toileting assistance",
      "かむこと / chewing",
      "入浴を手伝う / bathing assistance"
    ], correctIndex: 0, explanation: "【音声】認知症\n\n「認知症」は「記憶や判断が低下する病気」という意味です。" },
    { id: 49, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "見当識障害", choices: [
      "時間や場所が分からない / disorientation",
      "気持ちに寄り添う / empathy",
      "歩行を助けるつえ / cane",
      "横になっている姿勢 / lying position"
    ], correctIndex: 0, explanation: "【音声】見当識障害\n\n「見当識障害」は「時間や場所が分からない」という意味です。" },
    { id: 50, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "徘徊", choices: [
      "持ち上げ移動する機器 / lift",
      "目的なく歩き回る / wandering",
      "体温・血圧など生命徴候 / vital signs",
      "介護の計画 / care plan"
    ], correctIndex: 1, explanation: "【音声】徘徊\n\n「徘徊」は「目的なく歩き回る」という意味です。" },
    { id: 51, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "せん妄", choices: [
      "急に混乱し意識が変化 / delirium",
      "サービスを利用する人 / service user",
      "相手をそのまま受け入れる / acceptance",
      "身だしなみを整える / grooming"
    ], correctIndex: 0, explanation: "【音声】せん妄\n\n「せん妄」は「急に混乱し意識が変化」という意味です。" },
    { id: 52, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "不穏", choices: [
      "飲み込みやすくする粘り / thickener",
      "場所を移る / move",
      "姿勢を変える / repositioning",
      "落ち着かず興奮している / agitation"
    ], correctIndex: 3, explanation: "【音声】不穏\n\n「不穏」は「落ち着かず興奮している」という意味です。" },
    { id: 53, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "帰宅願望", choices: [
      "家に帰りたいと思い続ける / desire to go home",
      "身だしなみを整える / grooming",
      "薬を間違える / medication error",
      "状態の変化を継続確認 / monitoring"
    ], correctIndex: 0, explanation: "【音声】帰宅願望\n\n「帰宅願望」は「家に帰りたいと思い続ける」という意味です。" },
    { id: 54, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "異食", choices: [
      "食べ物以外を口にする / pica",
      "血の圧力 / blood pressure",
      "飲み込んではいけない物を飲み込む / accidental ingestion",
      "関係者で集まる会議 / care conference"
    ], correctIndex: 0, explanation: "【音声】異食\n\n「異食」は「食べ物以外を口にする」という意味です。" },
    { id: 55, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "物取られ妄想", choices: [
      "物を盗まれたと思い込む / delusion of theft",
      "高さ調整できるベッド / care bed",
      "姿勢を変える / repositioning",
      "関節が動きにくくなる / contracture"
    ], correctIndex: 0, explanation: "【音声】物取られ妄想\n\n「物取られ妄想」は「物を盗まれたと思い込む」という意味です。" },
    { id: 56, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "傾聴", choices: [
      "よく聴いて受け止める / active listening",
      "飲み込むこと / swallowing",
      "日帰りで通うサービス / day service",
      "ベッド端で座る姿勢 / sitting at bed edge"
    ], correctIndex: 0, explanation: "【音声】傾聴\n\n「傾聴」は「よく聴いて受け止める」という意味です。" },
    { id: 57, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "受容", choices: [
      "介護老人保健施設 / health services facility",
      "落ち着かず興奮している / agitation",
      "体の温度 / body temperature",
      "相手をそのまま受け入れる / acceptance"
    ], correctIndex: 3, explanation: "【音声】受容\n\n「受容」は「相手をそのまま受け入れる」という意味です。" },
    { id: 58, sectionId: "dementia", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "共感", choices: [
      "やわらかい食事 / soft diet",
      "皮膚が赤くなる / redness",
      "意識の状態 / level of consciousness",
      "気持ちに寄り添う / empathy"
    ], correctIndex: 3, explanation: "【音声】共感\n\n「共感」は「気持ちに寄り添う」という意味です。" },
    // ===== 用具・設備 =====
    { id: 59, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "車椅子", choices: [
      "介護老人保健施設 / health services facility",
      "介護の計画 / care plan",
      "座って移動するいす / wheelchair",
      "歩行を助けるつえ / cane"
    ], correctIndex: 2, explanation: "【音声】車椅子\n\n「車椅子」は「座って移動するいす」という意味です。" },
    { id: 60, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "歩行器", choices: [
      "歩くのを助ける器具 / walker",
      "生活動作を助ける道具 / assistive device",
      "恥ずかしい気持ち / sense of shame",
      "介護を行う職員 / care worker"
    ], correctIndex: 0, explanation: "【音声】歩行器\n\n「歩行器」は「歩くのを助ける器具」という意味です。" },
    { id: 61, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "杖", choices: [
      "薬を間違える / medication error",
      "歩行を助けるつえ / cane",
      "食器を下げる / clearing dishes",
      "口の中を清潔にする / oral care"
    ], correctIndex: 1, explanation: "【音声】杖\n\n「杖」は「歩行を助けるつえ」という意味です。" },
    { id: 62, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "介護ベッド", choices: [
      "体の温度 / body temperature",
      "相手をそのまま受け入れる / acceptance",
      "高さ調整できるベッド / care bed",
      "急に状態が悪化 / sudden change"
    ], correctIndex: 2, explanation: "【音声】介護ベッド\n\n「介護ベッド」は「高さ調整できるベッド」という意味です。" },
    { id: 63, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "手すり", choices: [
      "施設に住む人 / resident",
      "つかまる棒 / handrail",
      "細かく刻んだ食事 / chopped diet",
      "看護を行う専門職 / nurse"
    ], correctIndex: 1, explanation: "【音声】手すり\n\n「手すり」は「つかまる棒」という意味です。" },
    { id: 64, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ナースコール", choices: [
      "家に帰りたいと思い続ける / desire to go home",
      "姿勢を変える / repositioning",
      "呼び出しボタン / nurse call",
      "ヒヤリとした出来事の報告 / near-miss report"
    ], correctIndex: 2, explanation: "【音声】ナースコール\n\n「ナースコール」は「呼び出しボタン」という意味です。" },
    { id: 65, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ポータブルトイレ", choices: [
      "部屋で使える便器 / portable toilet",
      "横になっている姿勢 / lying position",
      "生活動作訓練の専門職 / occupational therapist",
      "自分でできる / independent"
    ], correctIndex: 0, explanation: "【音声】ポータブルトイレ\n\n「ポータブルトイレ」は「部屋で使える便器」という意味です。" },
    { id: 66, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "リフト", choices: [
      "持ち上げ移動する機器 / lift",
      "息ができない / choking",
      "寝たまま運ぶ担架 / stretcher",
      "体温・血圧など生命徴候 / vital signs"
    ], correctIndex: 0, explanation: "【音声】リフト\n\n「リフト」は「持ち上げ移動する機器」という意味です。" },
    { id: 67, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ストレッチャー", choices: [
      "座って移動するいす / wheelchair",
      "寝たまま運ぶ担架 / stretcher",
      "ヒヤリとした出来事の報告 / near-miss report",
      "ミキサーでペースト状 / pureed diet"
    ], correctIndex: 1, explanation: "【音声】ストレッチャー\n\n「ストレッチャー」は「寝たまま運ぶ担架」という意味です。" },
    { id: 68, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "自助具", choices: [
      "持ち上げ移動する機器 / lift",
      "体の動きを制限する / physical restraint",
      "生活動作を助ける道具 / assistive device",
      "サービスを利用する人 / service user"
    ], correctIndex: 2, explanation: "【音声】自助具\n\n「自助具」は「生活動作を助ける道具」という意味です。" },
    { id: 69, sectionId: "equipment", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "尿取りパッド", choices: [
      "むくみ / edema",
      "救急車で病院へ運ぶ / emergency transport",
      "尿を吸収するパッド / incontinence pad",
      "食べ物以外を口にする / pica"
    ], correctIndex: 2, explanation: "【音声】尿取りパッド\n\n「尿取りパッド」は「尿を吸収するパッド」という意味です。" },
    // ===== 記録・事務 =====
    { id: 70, sectionId: "record", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ケース記録", choices: [
      "息をすること / breathing",
      "暑さで体調不良 / heatstroke",
      "支援内容を記録する / case notes",
      "説明に同意した書面 / consent form"
    ], correctIndex: 2, explanation: "【音声】ケース記録\n\n「ケース記録」は「支援内容を記録する」という意味です。" },
    { id: 71, sectionId: "record", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ケアプラン", choices: [
      "介護の計画 / care plan",
      "尿を吸収するパッド / incontinence pad",
      "関節が動きにくくなる / contracture",
      "高さ調整できるベッド / care bed"
    ], correctIndex: 0, explanation: "【音声】ケアプラン\n\n「ケアプラン」は「介護の計画」という意味です。" },
    { id: 72, sectionId: "record", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ヒヤリハット報告書", choices: [
      "ヒヤリとした出来事の報告 / near-miss report",
      "食事を手伝う / feeding assistance",
      "皮膚が赤くなる / redness",
      "座って移動するいす / wheelchair"
    ], correctIndex: 0, explanation: "【音声】ヒヤリハット報告書\n\n「ヒヤリハット報告書」は「ヒヤリとした出来事の報告」という意味です。" },
    { id: 73, sectionId: "record", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "申し送り", choices: [
      "情報を次の担当へ伝える / handover",
      "飲み込みやすくする粘り / thickener",
      "身だしなみを整える / grooming",
      "家に帰りたいと思い続ける / desire to go home"
    ], correctIndex: 0, explanation: "【音声】申し送り\n\n「申し送り」は「情報を次の担当へ伝える」という意味です。" },
    { id: 74, sectionId: "record", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "バイタル表", choices: [
      "時間や場所が分からない / disorientation",
      "バイタルを記録する表 / vital chart",
      "目的なく歩き回る / wandering",
      "息ができない / choking"
    ], correctIndex: 1, explanation: "【音声】バイタル表\n\n「バイタル表」は「バイタルを記録する表」という意味です。" },
    { id: 75, sectionId: "record", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "モニタリング", choices: [
      "説明に同意した書面 / consent form",
      "すべて介助が必要 / total assistance",
      "状態の変化を継続確認 / monitoring",
      "部屋で使える便器 / portable toilet"
    ], correctIndex: 2, explanation: "【音声】モニタリング\n\n「モニタリング」は「状態の変化を継続確認」という意味です。" },
    { id: 76, sectionId: "record", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "担当者会議", choices: [
      "ベッドから起き上がる / getting out of bed",
      "座って移動するいす / wheelchair",
      "生活動作を助ける道具 / assistive device",
      "関係者で集まる会議 / care conference"
    ], correctIndex: 3, explanation: "【音声】担当者会議\n\n「担当者会議」は「関係者で集まる会議」という意味です。" },
    { id: 77, sectionId: "record", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "同意書", choices: [
      "自分でできる / independent",
      "特別養護老人ホーム / special nursing home",
      "家に帰りたいと思い続ける / desire to go home",
      "説明に同意した書面 / consent form"
    ], correctIndex: 3, explanation: "【音声】同意書\n\n「同意書」は「説明に同意した書面」という意味です。" },
    // ===== 施設・専門職 =====
    { id: 78, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "利用者", choices: [
      "むくみ / edema",
      "サービスを利用する人 / service user",
      "介護を行う職員 / care worker",
      "高い所から落ちる / fall from height"
    ], correctIndex: 1, explanation: "【音声】利用者\n\n「利用者」は「サービスを利用する人」という意味です。" },
    { id: 79, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "入居者", choices: [
      "施設に住む人 / resident",
      "認知症等の共同生活施設 / group home",
      "床ずれ / pressure ulcer",
      "尿を吸収するパッド / incontinence pad"
    ], correctIndex: 0, explanation: "【音声】入居者\n\n「入居者」は「施設に住む人」という意味です。" },
    { id: 80, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ケアマネジャー", choices: [
      "服を着替える / change clothes",
      "支援内容を記録する / case notes",
      "介護を行う職員 / care worker",
      "ケアプランを作る専門職 / care manager"
    ], correctIndex: 3, explanation: "【音声】ケアマネジャー\n\n「ケアマネジャー」は「ケアプランを作る専門職」という意味です。" },
    { id: 81, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ヘルパー", choices: [
      "飲み込みやすくする粘り / thickener",
      "体の動きを制限する / physical restraint",
      "介護を行う職員 / care worker",
      "姿勢を変える / repositioning"
    ], correctIndex: 2, explanation: "【音声】ヘルパー\n\n「ヘルパー」は「介護を行う職員」という意味です。" },
    { id: 82, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "ナース", choices: [
      "相手をそのまま受け入れる / acceptance",
      "高い所から落ちる / fall from height",
      "看護を行う専門職 / nurse",
      "かむこと / chewing"
    ], correctIndex: 2, explanation: "【音声】ナース\n\n「ナース」は「看護を行う専門職」という意味です。" },
    { id: 83, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "PT", choices: [
      "体の機能訓練の専門職 / physical therapist",
      "脈の回数 / pulse rate",
      "皮膚が赤くなる / redness",
      "入浴を手伝う / bathing assistance"
    ], correctIndex: 0, explanation: "【音声】PT\n\n「PT」は「体の機能訓練の専門職」という意味です。" },
    { id: 84, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "OT", choices: [
      "安全のためそばで様子を見る / supervision",
      "生活動作訓練の専門職 / occupational therapist",
      "ミキサーでペースト状 / pureed diet",
      "生活動作を助ける道具 / assistive device"
    ], correctIndex: 1, explanation: "【音声】OT\n\n「OT」は「生活動作訓練の専門職」という意味です。" },
    { id: 85, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "特養", choices: [
      "かむこと / chewing",
      "特別養護老人ホーム / special nursing home",
      "食べ物が気管に入る / aspiration",
      "おむつを替える / diaper change"
    ], correctIndex: 1, explanation: "【音声】特養\n\n「特養」は「特別養護老人ホーム」という意味です。" },
    { id: 86, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "老健", choices: [
      "介護老人保健施設 / health services facility",
      "状態の変化を継続確認 / monitoring",
      "安全のためそばで様子を見る / supervision",
      "呼び出しボタン / nurse call"
    ], correctIndex: 0, explanation: "【音声】老健\n\n「老健」は「介護老人保健施設」という意味です。" },
    { id: 87, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "デイサービス", choices: [
      "介護老人保健施設 / health services facility",
      "やわらかい食事 / soft diet",
      "座って移動するいす / wheelchair",
      "日帰りで通うサービス / day service"
    ], correctIndex: 3, explanation: "【音声】デイサービス\n\n「デイサービス」は「日帰りで通うサービス」という意味です。" },
    { id: 88, sectionId: "facility", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "グループホーム", choices: [
      "飲み込むこと / swallowing",
      "支援内容を記録する / case notes",
      "日帰りで通うサービス / day service",
      "認知症等の共同生活施設 / group home"
    ], correctIndex: 3, explanation: "【音声】グループホーム\n\n「グループホーム」は「認知症等の共同生活施設」という意味です。" },
    // ===== リスク・緊急時 =====
    { id: 89, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "転倒", choices: [
      "立ったまま倒れる / fall",
      "関係者で集まる会議 / care conference",
      "息をすること / breathing",
      "看護を行う専門職 / nurse"
    ], correctIndex: 0, explanation: "【音声】転倒\n\n「転倒」は「立ったまま倒れる」という意味です。" },
    { id: 90, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "転落", choices: [
      "息をすること / breathing",
      "高い所から落ちる / fall from height",
      "座って移動するいす / wheelchair",
      "食事を配る / serving meals"
    ], correctIndex: 1, explanation: "【音声】転落\n\n「転落」は「高い所から落ちる」という意味です。" },
    { id: 91, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "急変", choices: [
      "急に状態が悪化 / sudden change",
      "細かく刻んだ食事 / chopped diet",
      "バイタルを記録する表 / vital chart",
      "時間や場所が分からない / disorientation"
    ], correctIndex: 0, explanation: "【音声】急変\n\n「急変」は「急に状態が悪化」という意味です。" },
    { id: 92, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "窒息", choices: [
      "脈の回数 / pulse rate",
      "息ができない / choking",
      "高い所から落ちる / fall from height",
      "ベッド⇄車椅子などへ移る / transfer"
    ], correctIndex: 1, explanation: "【音声】窒息\n\n「窒息」は「息ができない」という意味です。" },
    { id: 93, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "脱水", choices: [
      "体の動きを制限する / physical restraint",
      "情報を次の担当へ伝える / handover",
      "認知症等の共同生活施設 / group home",
      "水分不足 / dehydration"
    ], correctIndex: 3, explanation: "【音声】脱水\n\n「脱水」は「水分不足」という意味です。" },
    { id: 94, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "熱中症", choices: [
      "体の温度 / body temperature",
      "サービスを利用する人 / service user",
      "暑さで体調不良 / heatstroke",
      "飲み込みやすくする粘り / thickener"
    ], correctIndex: 2, explanation: "【音声】熱中症\n\n「熱中症」は「暑さで体調不良」という意味です。" },
    { id: 95, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "感染症", choices: [
      "日帰りで通うサービス / day service",
      "病原体による病気 / infectious disease",
      "やわらかい食事 / soft diet",
      "ケアプランを作る専門職 / care manager"
    ], correctIndex: 1, explanation: "【音声】感染症\n\n「感染症」は「病原体による病気」という意味です。" },
    { id: 96, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "隔離", choices: [
      "身だしなみを整える / grooming",
      "感染予防で分ける / isolation",
      "介護を行う職員 / care worker",
      "体の機能訓練の専門職 / physical therapist"
    ], correctIndex: 1, explanation: "【音声】隔離\n\n「隔離」は「感染予防で分ける」という意味です。" },
    { id: 97, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "身体拘束", choices: [
      "恥ずかしい気持ち / sense of shame",
      "暑さで体調不良 / heatstroke",
      "体の動きを制限する / physical restraint",
      "状態の変化を継続確認 / monitoring"
    ], correctIndex: 2, explanation: "【音声】身体拘束\n\n「身体拘束」は「体の動きを制限する」という意味です。" },
    { id: 98, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "虐待", choices: [
      "食べ物以外を口にする / pica",
      "感染予防で分ける / isolation",
      "暴力・放置など不適切な扱い / abuse",
      "皮膚が赤くなる / redness"
    ], correctIndex: 2, explanation: "【音声】虐待\n\n「虐待」は「暴力・放置など不適切な扱い」という意味です。" },
    { id: 99, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "誤薬", choices: [
      "生活動作を助ける道具 / assistive device",
      "支援内容を記録する / case notes",
      "薬を間違える / medication error",
      "恥ずかしい気持ち / sense of shame"
    ], correctIndex: 2, explanation: "【音声】誤薬\n\n「誤薬」は「薬を間違える」という意味です。" },
    { id: 100, sectionId: "risk", question: "音声を聞いて、意味として正しいものを選んでください。", listeningText: "救急搬送", choices: [
      "感染予防で分ける / isolation",
      "高さ調整できるベッド / care bed",
      "救急車で病院へ運ぶ / emergency transport",
      "脈の回数 / pulse rate"
    ], correctIndex: 2, explanation: "【音声】救急搬送\n\n「救急搬送」は「救急車で病院へ運ぶ」という意味です。" },
  ],
}

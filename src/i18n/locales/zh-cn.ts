import type { LocaleMessages } from "../types";

export const zhCN: LocaleMessages = {
  name: "简体中文",
  hour12: false,
  views: { day: "日", week: "周", month: "月" },
  today: "今天",
  createNew: "新建日程",
  untitled: "未命名日程",
  confirm: "确认",
  cancel: "取消",
  titlePlaceholder: "添加标题",
  delete: "删除日程",
  by: "创建人",
  more: "还有 {n} 项",
  monthsLong: [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月",
  ],
  weekdaysShort: ["日", "一", "二", "三", "四", "五", "六"],
  weekdaysLong: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
  titleFormat: {
    day: "YYYY年M月D日 dddd",
    week: "YYYY年M月",
    month: "YYYY年M月",
  },
};

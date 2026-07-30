import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App";
import seed from "../data/guild-seed.v0.1.json";
import type { GuildProject } from "../domain/project";
import {
  clearDraft,
  loadDraft,
  saveDraft
} from "../features/project/persistence";

describe("workbench interaction", () => {
  beforeEach(async () => {
    await clearDraft();
  });

  it("edits a hero field through the visual form", async () => {
    render(<App />);
    await waitFor(() =>
      expect(screen.queryByText("正在检查本地草稿")).not.toBeInTheDocument()
    );
    const impression = screen.getByLabelText("一句话印象");
    fireEvent.change(impression, { target: { value: "新的阿斯特丽德印象" } });
    expect(impression).toHaveValue("新的阿斯特丽德印象");
  });

  it("runs the lullaby soothe branch without touching JSON", async () => {
    render(<App />);
    await waitFor(() =>
      expect(screen.queryByText("正在检查本地草稿")).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /预览/ }));
    fireEvent.click(
      screen.getByRole("button", {
        name: /不要激怒她！尝试对话/
      })
    );
    fireEvent.click(screen.getByRole("button", { name: "运行结果判定" }));
    expect(await screen.findByText("lullaby_soothe_success")).toBeInTheDocument();
    expect(screen.getByText("成功")).toBeInTheDocument();
    expect(screen.getByText(/矿工们在矿坑深处被发现/)).toBeInTheDocument();
  });

  it("shows source gaps separately from blocking errors", async () => {
    render(<App />);
    await waitFor(() =>
      expect(screen.queryByText("正在检查本地草稿")).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /问题/ }));
    expect(screen.getByText("阻断错误")).toBeInTheDocument();
    expect(screen.getByText("原案缺口")).toBeInTheDocument();
    expect(
      screen.getByText("原案只有一个结果示例，不是完整结果组；工作台不补写其余结果。")
    ).toBeInTheDocument();
  });
});

describe("indexedDB draft", () => {
  it("saves and restores the complete project", async () => {
    const project = structuredClone(seed) as GuildProject;
    project.heroes[2].impression = "草稿中的凛";
    await saveDraft(project);
    expect(await loadDraft()).toEqual(project);
  });
});

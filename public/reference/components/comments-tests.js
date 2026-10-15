const button = document.querySelector("#run-checks");
const frame = document.querySelector("#comment-examples");
const results = document.querySelector("#check-results");

button.disabled = !frame.contentDocument?.querySelector("article.comment--layout");
frame.addEventListener("load", () => {
  button.disabled = !frame.contentDocument?.querySelector("article.comment--layout");
}, { once: true });

function inspectDocument(doc, expectedWidth) {
  const comments = [...doc.querySelectorAll("article.comment--layout")];
  const ids = comments.map((comment) => comment.id);
  const duplicateIDs = ids.filter((id, index) => !id || ids.indexOf(id) !== index);
  const badTimes = [...doc.querySelectorAll("article.comment--layout time")]
    .filter((time) => !time.dateTime || Number.isNaN(Date.parse(time.dateTime))).length;
  const unnamedAvatarLinks = [...doc.querySelectorAll(".comment-avatar")]
    .filter((avatar) => avatar.tagName.toLowerCase() === "a" && !(avatar.getAttribute("aria-label") || avatar.textContent.trim())).length;
  const nondecorativeAvatars = [...doc.querySelectorAll(".comment-avatar img")]
    .filter((img) => img.getAttribute("alt") !== "").length;
  const imagesWithoutAlt = [...doc.querySelectorAll(".comment-body img")]
    .filter((img) => !img.hasAttribute("alt")).length;
  const badNesting = doc.querySelectorAll(".comment--layout a a, .comment--layout a button, .comment--layout button a, .comment--layout button button").length;
  const permalinkNamesMismatch = [...doc.querySelectorAll("article.comment--layout .comment-permalink[aria-label]")]
    .some((link) => !link.getAttribute("aria-label").trim().startsWith(link.querySelector("time")?.textContent.trim() || ""));
  const missingPermalinks = [...doc.querySelectorAll(".comment-permalink[href^='#']")]
    .filter((link) => !doc.getElementById(decodeURIComponent(link.hash.slice(1)))).length;
  const liveComments = comments.filter((comment) => comment.closest("[aria-live], [role=log], [role=status]")).length;
  const actionsOutsideFooter = [...doc.querySelectorAll(".comment-actions a, .comment-actions button")]
    .filter((control) => !control.closest(".comment-footer") || control.closest(".comment-meta, .comment-author, .comment-permalink")).length;
  const pageWidth = doc.documentElement.scrollWidth;
  const viewportWidth = doc.documentElement.clientWidth;
  const overflowingComments = comments.filter((comment) => comment.scrollWidth > comment.clientWidth + 1 || comment.getBoundingClientRect().right > viewportWidth + 1).map((comment) => comment.id);
  const overlappingAuthorTimes = comments.filter((comment) => {
    const author = comment.querySelector(".comment-author")?.getBoundingClientRect();
    const time = comment.querySelector(".comment-permalink, .comment-timestamp")?.getBoundingClientRect();
    return author && time && author.left < time.right && time.left < author.right && author.top < time.bottom && time.top < author.bottom;
  }).map((comment) => comment.id);
  const mediaOverflow = [...doc.querySelectorAll(".comment-body img, .comment-body video")]
    .filter((media) => media.getBoundingClientRect().width > media.parentElement.getBoundingClientRect().width + 1).length;
  const codeBlocks = [...doc.querySelectorAll(".comment-body pre")];
  const longCodeContained = expectedWidth !== 320 || codeBlocks.some((pre) =>
    pre.scrollWidth > pre.clientWidth && ["auto", "scroll"].includes(getComputedStyle(pre).overflowX));
  const sourcePairsMatch = expectedWidth !== 1280 || (
    Math.abs(doc.querySelector("#proposal-comment-source").getBoundingClientRect().height - doc.querySelector("#proposal-comment-42").getBoundingClientRect().height) <= 1 &&
    Math.abs(doc.querySelector("#post-815-source").getBoundingClientRect().height - doc.querySelector("#post-815").getBoundingClientRect().height) <= 1
  );
  const sourceAuthor = doc.querySelector("#proposal-comment-source .font-bold.text-fg.underline");
  const sharedAuthor = doc.querySelector("#proposal-comment-42 .author");
  const sourceAuthorStyle = sourceAuthor && getComputedStyle(sourceAuthor);
  const sharedAuthorStyle = sharedAuthor && getComputedStyle(sharedAuthor);
  const authorStylesMatch = expectedWidth !== 1280 || (
    sourceAuthorStyle && sharedAuthorStyle &&
    sourceAuthorStyle.color === sharedAuthorStyle.color &&
    sourceAuthorStyle.fontWeight === sharedAuthorStyle.fontWeight &&
    sourceAuthorStyle.textDecorationLine === sharedAuthorStyle.textDecorationLine
  );
  const actions = doc.querySelector("#chat-reply-816 .comment-actions");
  const actionsStyle = actions && getComputedStyle(actions);
  const actionsReset = actionsStyle && actionsStyle.listStyleType === "none" &&
    actionsStyle.marginBlockStart === "0px" && actionsStyle.marginBlockEnd === "0px" &&
    actionsStyle.paddingInlineStart === "0px" && actionsStyle.paddingInlineEnd === "0px";
  const inheritedScheme = doc.querySelector("#comment-inherited-scheme");
  const inheritsParentScheme = expectedWidth !== 1280 || (
    getComputedStyle(inheritedScheme).color === getComputedStyle(inheritedScheme.parentElement).color &&
    getComputedStyle(inheritedScheme).backgroundColor === "rgba(0, 0, 0, 0)"
  );

  return [
    ["unique stable IDs", comments.length >= 10 && duplicateIDs.length === 0],
    ["semantic time values", badTimes === 0],
    ["linked avatar names and decorative avatar images", unnamedAvatarLinks === 0 && nondecorativeAvatars === 0],
    ["rich images have alt attributes", imagesWithoutAlt === 0],
    ["valid nesting and permalink targets", badNesting === 0 && missingPermalinks === 0],
    ["permalink names include their visible time text", !permalinkNamesMismatch],
    ["actions stay in the separate footer", actionsOutsideFooter === 0],
    ["no automatic comment live regions", liveComments === 0],
    [`no page or comment overflow at ${expectedWidth}px`, pageWidth <= viewportWidth + 1 && overflowingComments.length === 0],
    [`author and timestamp do not overlap at ${expectedWidth}px`, overlappingAuthorTimes.length === 0],
    [`media stays within comment bodies at ${expectedWidth}px`, mediaOverflow === 0],
    [`code scrolls inside its own area at 320px`, longCodeContained],
    [`consumer source and shared examples match at desktop`, sourcePairsMatch],
    [`author link appearance matches its consumer source`, authorStylesMatch],
    [`action lists reset prose bullets and spacing`, actionsReset],
    [`comment inherits its surrounding scheme`, inheritsParentScheme],
  ];
}

button.addEventListener("click", async () => {
  button.disabled = true;
  const initialFrameWidth = frame.style.width;
  const report = [];
  try {
    const doc = frame.contentDocument;
    if (!doc || doc.readyState !== "complete") throw new Error("The comment examples have not finished loading.");
    for (const width of [1280, 640, 375, 320]) {
      frame.style.width = `${width}px`;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const checks = inspectDocument(frame.contentDocument, width);
      report.push({ width, checks: checks.map(([name, passed]) => ({ name, result: passed ? "PASS" : "FAIL" })) });
    }
    const failures = report.flatMap((entry) => entry.checks.filter((check) => check.result === "FAIL").map((check) => `${entry.width}px: ${check.name}`));
    results.textContent = failures.length
      ? `Checks found ${failures.length} issue(s):\n${failures.map((item) => `- ${item}`).join("\n")}`
      : report.map((entry) => `${entry.width}px: ${entry.checks.length} checks passed`).join("\n");
  } catch (error) {
    results.textContent = `Checks could not run: ${error instanceof Error ? error.message : "The comment examples are unavailable."}`;
  } finally {
    frame.style.width = initialFrameWidth;
    button.disabled = false;
  }
});

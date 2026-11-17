// Every "### Question" heading starts a question; the lines below it are the answer.
export type FaqItem = { q: string; a: string };

export function parseFaq(markdown: string): FaqItem[] {
  const items: FaqItem[] = [];
  let question: string | null = null;
  let answer: string[] = [];

  const flush = () => {
    const text = answer.join("\n").trim();
    if (question && text) items.push({ q: question, a: text });
  };

  // browsers send text areas with Windows line endings (CR LF): normalise them first
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");

  for (const line of lines) {
    // two to four hash marks are accepted, so "## Question" works as well
    const match = /^#{2,4}\s+(.+?)\s*$/.exec(line);
    if (match) {
      flush();
      question = match[1];
      answer = [];
    } else if (question) {
      answer.push(line);
    }
  }
  flush();

  return items;
}
async function readText(path) {
  try {
    const response=await fetch(path,{cache:"no-store"});
    if (!response.ok) return null;
    return (await response.text()).trim() || null;
  } catch {
    return null;
  }
}

export async function readBuildIdentity() {
  const [commit,branch]=await Promise.all([
    readText("./COMMIT.txt"),
    readText("./BRANCH.txt")
  ]);
  return {
    commit:commit || "local",
    branch:branch || "local"
  };
}

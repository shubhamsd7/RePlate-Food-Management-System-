const { getUncachableGitHubClient, isGitHubConfigured } = require('./github-client.js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function pushToGitHub() {
  try {
    // Check if GitHub is configured
    const isConfigured = await isGitHubConfigured();
    if (!isConfigured) {
      console.error('❌ GitHub is not configured. Please set up the GitHub integration.');
      process.exit(1);
    }

    console.log('🔍 Checking for changes...');
    
    // Get list of changed files
    let changedFiles;
    try {
      changedFiles = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).trim().split('\n').filter(f => f);
    } catch (error) {
      changedFiles = [];
    }

    let untrackedFiles;
    try {
      untrackedFiles = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }).trim().split('\n').filter(f => f);
    } catch (error) {
      untrackedFiles = [];
    }

    const allChangedFiles = [...changedFiles, ...untrackedFiles].filter(f => f);

    if (allChangedFiles.length === 0) {
      console.log('✅ No changes to push!');
      return;
    }

    console.log(`📝 Found ${allChangedFiles.length} changed file(s):`);
    allChangedFiles.forEach(file => console.log(`   - ${file}`));

    // Get the GitHub client
    console.log('\n🔐 Authenticating with GitHub...');
    const octokit = await getUncachableGitHubClient();

    // Get user info
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`✅ Authenticated as: ${user.login}`);

    // Parse the repository from git remote
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const repoMatch = remoteUrl.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
    
    if (!repoMatch) {
      console.error('❌ Could not parse GitHub repository from remote URL:', remoteUrl);
      process.exit(1);
    }

    const owner = repoMatch[1];
    const repo = repoMatch[2];

    console.log(`\n📦 Repository: ${owner}/${repo}`);

    // Get the current branch
    let currentBranch;
    try {
      currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      currentBranch = 'main';
    }

    console.log(`🌿 Branch: ${currentBranch}`);

    // Get current commit SHA
    let currentSHA;
    try {
      currentSHA = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      console.error('❌ Could not get current commit SHA');
      process.exit(1);
    }

    console.log(`\n📤 Creating commit via GitHub API...`);

    // Get the current tree
    const { data: currentCommit } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: currentSHA,
    });

    const baseTreeSHA = currentCommit.tree.sha;

    // Create blobs for each changed file
    const tree = [];
    for (const file of allChangedFiles) {
      const filePath = path.join(process.cwd(), file);
      
      // Skip if file doesn't exist (could be deleted)
      if (!fs.existsSync(filePath)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      
      const { data: blob } = await octokit.rest.git.createBlob({
        owner,
        repo,
        content,
        encoding: 'utf-8',
      });

      tree.push({
        path: file,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      });
    }

    // Create a new tree
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSHA,
      tree,
    });

    // Create a new commit
    const commitMessage = 'Add Get Started modal with restaurant/shelter selection';
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [currentSHA],
    });

    console.log(`✅ Created commit: ${newCommit.sha}`);

    // Update the reference (push)
    console.log(`\n🚀 Pushing to ${currentBranch}...`);
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${currentBranch}`,
      sha: newCommit.sha,
    });

    console.log(`\n✅ Successfully pushed to GitHub!`);
    console.log(`🔗 https://github.com/${owner}/${repo}/commit/${newCommit.sha}`);

  } catch (error) {
    console.error('\n❌ Error pushing to GitHub:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

pushToGitHub();

v2.0.0-alpha.0 - April 12, 2020

* [`51e48c6`](https://github.com/eslint/eslint-plugin-markdown/commit/51e48c68535964b1fe0f5c949d721baca4e6a1d6) Docs: Revamp documentation for v2 (#149) (Brandon Mills)
* [`b221391`](https://github.com/eslint/eslint-plugin-markdown/commit/b2213919e3973ebb3788295143c17e14f5fc3f3b) Docs: Dogfood plugin by linting readme (#145) (Brandon Mills)
* [`7423610`](https://github.com/eslint/eslint-plugin-markdown/commit/74236108b5c996b5f73046c2112270c7458cbae9) Docs: Explain use of --ext option in ESLint v7 (#146) (Brandon Mills)
* [`0d4dbe8`](https://github.com/eslint/eslint-plugin-markdown/commit/0d4dbe8a50852516e14f656007c60e9e7a180b0a) Breaking: Implement new processor API (fixes #138) (#144) (Brandon Mills)
* [`7eeafb8`](https://github.com/eslint/eslint-plugin-markdown/commit/7eeafb83e446f76bc4581381cd68dacc484b2249) Chore: Update ESLint config and plugins (#143) (Brandon Mills)
* [`f483343`](https://github.com/eslint/eslint-plugin-markdown/commit/f4833438fa2c06941f05e994eb1084321ce4cfb3) Breaking: Require ESLint v6 (#142) (Brandon Mills)
* [`9aa1fdc`](https://github.com/eslint/eslint-plugin-markdown/commit/9aa1fdca62733543d2c26a755ad14dbc02926f27) Chore: Use ES2018 object spread syntax (#141) (Brandon Mills)
* [`f584cc6`](https://github.com/eslint/eslint-plugin-markdown/commit/f584cc6f08f0eeac0e657ae45cbf561764fab696) Build: Remove Travis (#140) (Brandon Mills)
* [`35f9a11`](https://github.com/eslint/eslint-plugin-markdown/commit/35f9a11b407078774eef37295ba7ddb95c56f419) Breaking: Drop support for Node.js v6 (refs #138) (#137) (Brandon Mills)
* [`6f02ef5`](https://github.com/eslint/eslint-plugin-markdown/commit/6f02ef53abc08b5e35b56361f2bd7cbc7ea8e993) Chore: Add npm version and build status badges (#139) (Brandon Mills)

v1.0.2 - February 24, 2020

* [`52e0984`](https://github.com/eslint/eslint-plugin-markdown/commit/52e098483fdf958a8dce96ab66c52b4337d522fe) Upgrade: Update devDeps and change istanbul -> nyc (#130) (Brett Zamir)
* [`d52988f`](https://github.com/eslint/eslint-plugin-markdown/commit/d52988f5efcacb16862c79c1857e9b912cf3ffb0) Chore: Remove call to lint absent `Makefile.js` (#129) (Brett Zamir)
* [`5640ea6`](https://github.com/eslint/eslint-plugin-markdown/commit/5640ea65730abab5c9c97d77b5708f3499ec62f3) Fix: Apply base indent to multiple line breaks (fixes #127) (#128) (Brett Zamir)

v1.0.1 - October 21, 2019

* [`fb0b5a3`](https://github.com/eslint/eslint-plugin-markdown/commit/fb0b5a3fc36ad362556cafc49929f49e3b4bc6b0) Fix: Indent multiline fixes (fixes #120) (#124) (Brandon Mills)
* [`07c9017`](https://github.com/eslint/eslint-plugin-markdown/commit/07c9017551d3a3382126882cf08bc162afcab734) Chore: Use GitHub Actions (#123) (Brandon Mills)
* [`b5bf014`](https://github.com/eslint/eslint-plugin-markdown/commit/b5bf01465252a5d5ae3e1849b99b7d37bcd5a030) Chore: Add Node 12 to Travis (#122) (Brandon Mills)
* [`dc90961`](https://github.com/eslint/eslint-plugin-markdown/commit/dc909618aa8f39e84279f5bdeb4a888d56d919b1) Fix: Support autofix at the very start of blocks (fixes #117) (#119) (Simon Lydell)
* [`2de2490`](https://github.com/eslint/eslint-plugin-markdown/commit/2de2490f6d9dd5073bd9662d7ec6d61ceb13a811) Docs: Syntax highlight Markdown (#116) (Brett Zamir)
* [`fdacf0c`](https://github.com/eslint/eslint-plugin-markdown/commit/fdacf0c29e4c9267816df0918f1b372fbd8eef32) Chore: Upgrade to eslint-config-eslint@5.0.1 (#110) (Brandon Mills)

v1.0.0 - January 2, 2019

* [`2a8482e`](https://github.com/eslint/eslint-plugin-markdown/commit/2a8482e8e39da2ab4a1d8aeb7459f26a8377905d) Fix: `overrides` general docs and Atom linter-eslint tips (fixes #109) (#111) (Brett Zamir)

v1.0.0-rc.1 - November 5, 2018

* a2f4492 Fix: Allowing eslint-plugin-prettier to work (fixes #101) (#107) (simlu)

v1.0.0-rc.0 - October 27, 2018

* 8fe9a0e New: Enable autofix with --fix (fixes #58) (#97) (Bohdan Khodakivskyi)
* a5d0cce Fix: Ignore anything after space in code fence's language (fixes #98) (#99) (Francisco Ryan Tolmasky I)
* 6fd340d Upgrade: eslint-release@1.0.0 (#100) (Teddy Katz)
* dff8e9c Fix: Emit correct endLine numbers (#88) (Paul Murray)
* 83f00d0 Docs: Suggest disabling strict in .md files (fixes #94) (#95) (Brandon Mills)
* 3b4ff95 Build: Test against Node v10 (#96) (Brandon Mills)
* 6777977 Breaking: required node version 6+ (#89) (薛定谔的猫)
* 5582fce Docs: Updating CLA link (#93) (Pablo Nevares)
* 24070e6 Build: Upgrade to eslint-release@0.11.1 (#92) (Brandon Mills)
* 6cfd1f0 Docs: Add unicode-bom to list of unsatisfiable rules (#91) (Brandon Mills)

v1.0.0-beta.8 - April 8, 2018

* a1544c2 Chore: Add .npmrc to disable creating package-lock.json (#90) (Brandon Mills)
* 47ad3f9 Chore: Replace global comment integration test with unit test (refs #81) (#85) (Brandon Mills)
* e34acc6 Fix: Add unicode-bom to unsatisfiable rules (refs #75) (#84) (Brandon Mills)
* 7c19f8b Fix: Support globals (fixes #79) (#81) (Anders D. Johnson)

v1.0.0-beta.7 - July 2, 2017

* f8ba18a New: Custom eslint-skip HTML comment skips blocks (fixes #69) (#73) (Brandon Mills)
* 249904f Chore: Add test for code fences without blank lines (#72) (Brandon Mills)
* 3abc569 Chore: Un-disable strict and eol-last in repository (#71) (Brandon Mills)
* 132ea5b Chore: Add test ensuring config comments do not fall through (#70) (Brandon Mills)

v1.0.0-beta.6 - April 29, 2017

* c5e9d67 Build: Explicitly specify package.json files (#67) (Brandon Mills)

v1.0.0-beta.5 - April 29, 2017

* 7bd0f6e Build: Install eslint-release (#66) (Brandon Mills)
* 48122eb Build: Dogfood plugin without npm link (#65) (Brandon Mills)
* cc7deea Chore: Increase code coverage (#64) (Brandon Mills)
* 29f2f05 Build: Use eslint-release (#63) (Brandon Mills)
* d2f2962 Upgrade: remark (#62) (Titus)


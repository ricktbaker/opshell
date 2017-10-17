# Opshell Changelog
All notable changes to this project will be documented in this file.

## [0.1.3] - 2017-10-16
### Fixed
- Recent Bastion Host fix for choosing not to use it, was causing it not to work when selected.

## [0.1.2] - 2017-10-15
### Fixed
- Mispelling of Opshell in package.json, so db directory was in the wrong location.   Fixed with a small migration on startup
## Changed
- Slight adjustment to Menu Items.   Import/Export was moved to Opshell menu on Mac.   Added a Quit Opshell in the File Menu for Windows.
- More work on the css to prepare for theme switching.

## [0.1.1] - 2017-10-14
### Fixed
- Fixed a menu order issue with Windows.
- If a bastion host was setup, it was always going to use it, even if you had chosen not to for a specific connection.
### Added
- Added the ability to Export and Import Settings (orgs, regions, access keys, and ssh keys)


## [0.1.0] - 2017-10-13
### Fixed
- More changes to keep ssh term window from covering nav tabs.
### Added
- Added a Getting Started tab with some basic instructions on first usage.
- Added a Help Tab for Windows which will have the About, What's New and Getting Started Menu Items.
- Added a Help Tab for Mac which will have the Getting Started Menu item.
### Changed
- Cleaning up CSS and moving all colors to a theme CSS file to prepare for theme selection

## [0.0.10] - 2017-10-11
### Fixed
- SSH Window was covering top tabs if a aws region tab was in an overflow scroll state
- SSH tab size was much wider than the actual app window
- Several issues with SSH connections after removing jquery selectors.

## [0.0.9] - 2017-10-10
### Fixed
- Import / Update Keys was not popping up file selection box

## [0.0.8] - 2017-10-08
### Fixed
- SSH through a bastion host was not working properly due to a change in 0.0.7
- Tab headers now stay in place at top of screen when scrolling tab content
### Added
- Ability to set the default ssh user to a custom user instead of the standard AWS users
- Added a "What's New" menu item, to show changelog.  Will open first time app is opened when updated
### Changed
- Removed all modals except for the about window.   All configuration has been moved into a tab
- Removed most dom manipulation via jQuery in favor of Vue methods

## [0.0.7] - 2017-10-07
### Added
- Ability to add users to a region to ssh as instead of just the default aws users
- If no ssh key is uploaded it will try to do password authentication

## [0.0.6] - 2017-10-06
### Fixed
- Bastion Host was not properly saving
### Added
- About page
- Check for newer versions

## [0.0.5] - 2017-10-05
### Fixed
- Deleting a region was not deleting imported keys
### Added
- Added the ability to delete an Organization

## [0.0.4] - 2017-10-02
### Changed
- Renamed to Opshell, which changes file and db storage locations.  No migration for this, since it's only been publically available for a couple of days.

## [0.0.3] - 2017-09-30
### Fixed
- General UI fixes with selected options not showing selected by default
- Fixed an issue with running processes such as vi or top within the terminal

## [0.0.2] - 2017-09-29
### Added
- Ability to filter listed Instances by a search string
- Sort Instances by clicking on column header

## [0.0.1] - 2017-09-28
### Added
- Add Organizations
- Add Regions to Organizations
- Add AWS Access Keys to Regions
- Scan for Required SSH Keys in a Region
- Import/Update SSH Keys
- List Instances in a Region
- SSH to an Instance
- Add a Bastion Host to a Region
- SSH to an Instance through a Bastion Host
- Remember what user / ip was used to connect to an Instance

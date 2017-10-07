# Opshell Changelog
All notable changes to this project will be documented in this file.

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

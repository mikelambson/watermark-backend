# WaterMARK - BACKEND
### _Water Measurment Administration & Record Keeping - Backend Server_
[![Build Status](https://img.shields.io/static/v1?label=build&message=development&color=red)](https://img.shields.io)
[![GitHub issues](https://img.shields.io/github/issues/mikelambson/watermark-backend)](https://github.com/mikelambson/watermark-backend/issues)
[![GitHub license](https://img.shields.io/github/license/mikelambson/watermark-backend)](https://github.com/mikelambson/watermark-backend/blob/master/LICENSE)
![GitHub language count](https://img.shields.io/github/languages/count/mikelambson/watermark-backend)
![GitHub repo size](https://img.shields.io/github/repo-size/mikelambson/watermark-backend)
![GitHub package.json version](https://img.shields.io/github/package-json/v/mikelambson/watermark-backend)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/mikelambson/watermark-backend/dev/prisma/master)
![node-current](https://img.shields.io/node/v/latest)
![Static Badge](https://img.shields.io/badge/DBMS-PostgreSQL-%23336791)
![Static Badge](https://img.shields.io/badge/DBMS_Extension-TimescaleDB-%23f5ff80)

___
#### Information

Water Measurment Administration & Record Keeping => WaterMARK  
WaterMARK is a multi-source meter data aggregation, scheduling, task managemet and water order processing application.

___
#### API Method

API pattern:
`/api/dataSource?find:column=parameter>parameterRangeIndicator&find:anothercolumn=x,y,z`

We begin the route query with the `?find:` operator followed by the initial query parameter which is generally a column ref `=` a value.  This is extended when we add incorporate the data aspect into the lookup to allow for a singular date or a range via the `>` key.

These `find:column=value` methods can be chained via `&`.
For multiple values from the same column we can separate using `,`.

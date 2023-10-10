const legacyDataQuery = `
SELECT Orders.ORDER_TIME, Orders.ORDER_DATE, Master.[Irrigator's Name], Master.[Owner's Name], Orders.NAME, Orders.PHONE_NO, Orders.Phone_NO_2, Orders.PHONE_NO_3, Orders.[LATERAL 1], Orders.[LATERAL 2], Orders.[LATERAL 3], Orders.[LATERAL 4], Orders.APPROX_CFS, Orders.APPROX_HRS, Orders.ORDER_NO, Orders.TCID_SN, Orders.REMARKS, Format$(Round([APPROX_CFS]*[APPROX_HRS]*0.0825,2),"#,###.00") AS APPROX_AF, ([Aggregate Allocation]-[Used and Encumbered]) AS Balance, Orders.DISTRICT, Orders.ADJUST
FROM Orders LEFT JOIN Master ON Orders.TCID_SN = Master.[Serial #]
WHERE (((Orders.ADJUST)="O"));`;

export default legacyDataQuery;

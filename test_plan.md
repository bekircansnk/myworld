1. **Optimize CampaignExplorer.tsx**
   - Import `useMemo` in `app/web/src/components/ads-panel/campaigns/CampaignExplorer.tsx`.
   - Wrap the `campaigns.filter` operation with `useMemo`.
   - Hoist `searchTerm.toLowerCase()` outside of the array filter loop to avoid repetitive string conversions.
   - Add comments explaining the optimization and expected performance impact.
2. **Complete pre-commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
3. **Submit the change**
   - Commit and submit the code with a descriptive PR message containing the performance impact.

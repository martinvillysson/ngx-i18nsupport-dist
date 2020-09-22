/**
 * Created by roobm on 15.03.2017.
 * Interfaces for command line call and config file content.
 */
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaS14bGlmZi1tZXJnZS1vcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMveGxpZmZtZXJnZS9zcmMveGxpZmZtZXJnZS9pLXhsaWZmLW1lcmdlLW9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENyZWF0ZWQgYnkgcm9vYm0gb24gMTUuMDMuMjAxNy5cclxuICogSW50ZXJmYWNlcyBmb3IgY29tbWFuZCBsaW5lIGNhbGwgYW5kIGNvbmZpZyBmaWxlIGNvbnRlbnQuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIE9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIGFzIHByb2dyYW0gYXJndW1lbnRzLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBQcm9ncmFtT3B0aW9ucyB7XHJcbiAgICBxdWlldD86IGJvb2xlYW47XHJcbiAgICB2ZXJib3NlPzogYm9vbGVhbjtcclxuICAgIHByb2ZpbGVQYXRoPzogc3RyaW5nO1xyXG4gICAgbGFuZ3VhZ2VzPzogc3RyaW5nW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWZpbml0aW9uIG9mIHRoZSBwb3NzaWJsZSB2YWx1ZXMgdXNlZCBpbiB0aGUgY29uZmlnIGZpbGVcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUNvbmZpZ0ZpbGUge1xyXG4gICAgLy8gY29udGVudCBpcyB3cmFwcGVkIGluIFwieGxpZmZtZXJnZU9wdGlvbnNcIiB0byBhbGxvdyB0byB1c2UgaXQgZW1iZWRkZWQgaW4gYW5vdGhlciBjb25maWcgZmlsZSAoZS5nLiB0c2NvbmZpZy5qc29uKVxyXG4gICAgeGxpZmZtZXJnZU9wdGlvbnM/OiBJWGxpZmZNZXJnZU9wdGlvbnM7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVhsaWZmTWVyZ2VPcHRpb25zIHtcclxuICAgIHF1aWV0PzogYm9vbGVhbjsgICAvLyBGbGFnIHRvIG9ubHkgb3V0cHV0IGVycm9yIG1lc3NhZ2VzXHJcbiAgICB2ZXJib3NlPzogYm9vbGVhbjsgICAvLyBGbGFnIHRvIGdlbmVyYXRlIGRlYnVnIG91dHB1dCBtZXNzYWdlc1xyXG4gICAgYWxsb3dJZENoYW5nZT86IGJvb2xlYW47IC8vIFRyeSB0byBmaW5kIHRyYW5zbGF0aW9uIGV2ZW4gd2hlbiBpZCBpcyBtaXNzaW5nXHJcbiAgICBkZWZhdWx0TGFuZ3VhZ2U/OiBzdHJpbmc7ICAgIC8vIHRoZSBkZWZhdWx0IGxhbmd1YWdlICh0aGUgbGFuZ3VhZ2UsIHdoaWNoIGlzIHVzZWQgaW4gdGhlIG9yaWdpbmFsIHRlbXBsYXRlcylcclxuICAgIGxhbmd1YWdlcz86IHN0cmluZ1tdOyAgIC8vIGFsbCBsYW5ndWFnZXMsIGlmIG5vdCBzcGVjaWZpZWQgdmlhIGNvbW1hbmRsaW5lXHJcbiAgICBzcmNEaXI/OiBzdHJpbmc7ICAgIC8vIERpcmVjdG9yeSwgd2hlcmUgdGhlIG1hc3RlciBmaWxlIGlzXHJcbiAgICBpMThuQmFzZUZpbGU/OiBzdHJpbmc7IC8vIEJhc2VuYW1lIGZvciBpMThuIGlucHV0IGFuZCBvdXRwdXQsIGRlZmF1bHQgaXMgJ21lc3NhZ2VzJ1xyXG4gICAgaTE4bkZpbGU/OiBzdHJpbmc7ICAvLyBtYXN0ZXIgZmlsZSwgaWYgbm90IGFic29sdXRlLCBpdCBpcyByZWxhdGl2ZSB0byBzcmNEaXJcclxuICAgIGkxOG5Gb3JtYXQ/OiBzdHJpbmc7IC8vIHhsZiBvciB4bWJcclxuICAgIGVuY29kaW5nPzogc3RyaW5nOyAgLy8gZW5jb2RpbmcgdG8gd3JpdGUgeG1sXHJcbiAgICBnZW5EaXI/OiBzdHJpbmc7ICAgIC8vIGRpcmVjdG9yeSwgd2hlcmUgdGhlIGZpbGVzIGFyZSB3cml0dGVuIHRvXHJcbiAgICBhbmd1bGFyQ29tcGlsZXJPcHRpb25zPzoge1xyXG4gICAgICAgIGdlbkRpcj86IHN0cmluZzsgICAgLy8gc2FtZSBhcyBnZW5EaXIsIGp1c3QgdG8gYmUgY29tcGF0aWJsZSB3aXRoIG5nLXhpMThuXHJcbiAgICB9O1xyXG4gICAgcmVtb3ZlVW51c2VkSWRzPzogYm9vbGVhbjtcclxuICAgIHN1cHBvcnROZ3hUcmFuc2xhdGU/OiBib29sZWFuOyAgLy8gRmxhZywgd2V0aGVyIG91dHB1dCBmb3Igbmd4LXRyYW5zbGF0ZSBzaG91bGQgYmUgZ2VuZXJhdGVkXHJcbiAgICBuZ3hUcmFuc2xhdGVFeHRyYWN0aW9uUGF0dGVybj86IHN0cmluZzsgLy8gQ3JpdGVyaWEsIHdoYXQgbWVzc2FnZXMgc2hvdWxkIGJlIHVzZWQgZm9yIG5neC10cmFuc2xhdGUgb3V0cHV0XHJcbiAgICAgIC8vIHNlZSBkZXRhaWxzIG9uIHRoZSBkb2N1bWVudGF0aW9uIHBhZ2UgaHR0cHM6Ly9naXRodWIuY29tL21hcnRpbnJvb2Ivbmd4LWkxOG5zdXBwb3J0L3dpa2kvbmd4LXRyYW5zbGF0ZS11c2FnZVxyXG4gICAgdXNlU291cmNlQXNUYXJnZXQ/OiBib29sZWFuOyAvLyBGbGFnLCB3aGV0aGVyIHNvdXJjZSBtdXN0IGJlIHVzZWQgYXMgdGFyZ2V0IGZvciBuZXcgdHJhbnMtdW5pdHNcclxuICAgIHRhcmdldFByYWVmaXg/OiBzdHJpbmc7IC8vIFByYWVmaXggZm9yIHRhcmdldCBjb3BpZWQgZnJvbSBzb3VyY2VkXHJcbiAgICB0YXJnZXRTdWZmaXg/OiBzdHJpbmc7IC8vIFN1ZmZpeCBmb3IgdGFyZ2V0IGNvcGllZCBmcm9tIHNvdXJjZWRcclxuICAgIGJlYXV0aWZ5T3V0cHV0PzogYm9vbGVhbjsgLy8gYmVhdXRpZnkgb3V0cHV0XHJcbiAgICBwcmVzZXJ2ZU9yZGVyPzogYm9vbGVhbjsgLy8gcHJlc2VydmUgb3JkZXIgb2YgbmV3IHRyYW5zIHVuaXRzXHJcbiAgICBhdXRvdHJhbnNsYXRlPzogYm9vbGVhbnxzdHJpbmdbXTsgLy8gZW5hYmxlIGF1dG8gdHJhbnNsYXRlIHZpYSBHb29nbGUgVHJhbnNsYXRlXHJcbiAgICAgICAgLy8gaWYgaXQgaXMgYW4gYXJyYXksIGxpc3Qgb2YgbGFuZ3VhZ2VzIHRvIGF1dG90cmFuc2xhdGVcclxuICAgICAgICAvLyBpZiBpdCBpcyB0cnVlLCBhdXRvdHJhbnNsYXRlIGFsbCBsYW5ndWFnZXMgKGV4Y2VwdCBzb3VyY2UgbGFuZ3VhZ2Ugb2YgY291cnNlKVxyXG4gICAgICAgIC8vIGlmIGl0IGlzIGZhbHNlIChkZWZhdWx0KSBubyBhdXRvdHJhbnNsYXRlXHJcbiAgICBhcGlrZXk/OiBzdHJpbmc7ICAgIC8vIEFQSSBLZXkgZm9yIEdvb2dsZSBUcmFuc2xhdGUsIHJlcXVpcmVkIGlmIGF1dG90cmFuc2xhdGUgaXMgZW5hYmxlZFxyXG4gICAgYXBpa2V5ZmlsZT86IHN0cmluZzsgICAgLy8gZmlsZSBuYW1lIHdoZXJlIEFQSSBLZXkgZm9yIEdvb2dsZSBUcmFuc2xhdGUgY2FuIGJlIHJlYWQgZnJvbVxyXG59XHJcblxyXG4iXX0=
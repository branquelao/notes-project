using System.Text.RegularExpressions;

namespace NotesProjectAPI.Services
{
    public static class WikilinkParser
    {
        // Matches [[Title]], no nested brackets
        private static readonly Regex WikilinkRegex = new(
            @"\[\[([^\[\]]+)\]\]",
            RegexOptions.Compiled);

        // Extracts unique linked titles from Markdown content (does not resolve against the DB)
        public static IEnumerable<string> ExtractLinkedTitles(string? content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return Enumerable.Empty<string>();

            return WikilinkRegex
                .Matches(content)
                .Select(match => match.Groups[1].Value.Trim())
                .Where(title => !string.IsNullOrWhiteSpace(title))
                .Distinct(StringComparer.OrdinalIgnoreCase);
        }
    }
}